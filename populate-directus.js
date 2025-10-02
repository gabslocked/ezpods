const https = require('https');
const http = require('http');

// Configuração do Directus - ajuste essas variáveis conforme necessário
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'your-admin-token';

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const req = client.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = res.statusCode >= 200 && res.statusCode < 300 
                        ? JSON.parse(data) 
                        : { error: data, statusCode: res.statusCode };
                    resolve(result);
                } catch (e) {
                    resolve({ error: data, statusCode: res.statusCode });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Função para fazer requisições ao Directus
async function directusRequest(endpoint, method = 'GET', data = null) {
    const url = `${DIRECTUS_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const result = await makeRequest(url, options);
    
    if (result.error) {
        console.error(`Error ${method} ${endpoint}:`, result);
        throw new Error(result.error || 'Request failed');
    }
    
    return result;
}

// Função para buscar dados da API OlaClick
async function fetchOlaClickData() {
    console.log('🔄 Buscando dados da API OlaClick...');
    
    const url = 'https://api2.olaclick.app/ms-products/public/companies/43da3645-d217-4757-9dd4-4633fe4ae976/categories';
    const options = {
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
            'origin': 'https://ezpods.ola.click',
            'referer': 'https://ezpods.ola.click/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }
    };
    
    const result = await makeRequest(url, options);
    
    if (!result.success || !result.data) {
        throw new Error('Falha ao buscar dados da API OlaClick');
    }
    
    console.log(`✅ Dados obtidos: ${result.data.length} categorias`);
    return result.data;
}

// Função para popular categorias (limpar e recriar)
async function populateCategories(categories) {
    console.log('🔄 Populando categorias...');
    
    // Limpar categorias existentes
    try {
        const existingCategories = await directusRequest('/items/CategoriesV1');
        if (existingCategories.data && existingCategories.data.length > 0) {
            console.log('🗑️ Limpando categorias existentes...');
            for (const category of existingCategories.data) {
                await directusRequest(`/items/CategoriesV1/${category.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhuma categoria existente para limpar');
    }
    
    // Inserir novas categorias
    const categoryData = categories.map(category => ({
        name: category.name,
        description: category.description,
        image: category.image,
        position: category.position,
        visible: category.visible !== null ? category.visible : true,
        external_id: category.id
    }));
    
    const result = await directusRequest('/items/CategoriesV1', 'POST', categoryData);
    console.log(`✅ ${categoryData.length} categorias inseridas`);
    
    return result.data;
}

// Função para popular produtos
async function populateProducts(categories, directusCategories) {
    console.log('🔄 Populando produtos...');
    
    // Criar mapeamento de external_id para id do Directus
    const categoryMap = {};
    directusCategories.forEach(cat => {
        categoryMap[cat.external_id] = cat.id;
    });
    
    // Limpar produtos existentes
    try {
        const existingProducts = await directusRequest('/items/ProductsV1');
        if (existingProducts.data && existingProducts.data.length > 0) {
            console.log('🗑️ Limpando produtos existentes...');
            for (const product of existingProducts.data) {
                await directusRequest(`/items/ProductsV1/${product.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhum produto existente para limpar');
    }
    
    // Coletar todos os produtos de todas as categorias
    const allProducts = [];
    categories.forEach(category => {
        if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                allProducts.push({
                    name: product.name,
                    description: product.description,
                    position: product.position,
                    visible: product.visible,
                    external_id: product.id,
                    category_id: categoryMap[product.product_category_id],
                    product_category_id: product.product_category_id,
                    kitchen_id: product.kitchen_id
                });
            });
        }
    });
    
    if (allProducts.length === 0) {
        console.log('⚠️ Nenhum produto encontrado para inserir');
        return [];
    }
    
    // Inserir produtos em lotes de 50
    const batchSize = 50;
    const insertedProducts = [];
    
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        try {
            const result = await directusRequest('/items/ProductsV1', 'POST', batch);
            insertedProducts.push(...(Array.isArray(result.data) ? result.data : [result.data]));
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} produtos inseridos`);
        } catch (error) {
            console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, error.message);
            // Tentar inserir um por vez em caso de erro
            for (const product of batch) {
                try {
                    const singleResult = await directusRequest('/items/ProductsV1', 'POST', product);
                    insertedProducts.push(singleResult.data);
                } catch (singleError) {
                    console.error(`❌ Erro ao inserir produto ${product.name}:`, singleError.message);
                }
            }
        }
    }
    
    console.log(`✅ Total de ${insertedProducts.length} produtos inseridos`);
    return insertedProducts;
}

// Função para popular imagens dos produtos
async function populateProductImages(categories, directusProducts) {
    console.log('🔄 Populando imagens dos produtos...');
    
    // Criar mapeamento de external_id para id do Directus
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
    // Limpar imagens existentes
    try {
        const existingImages = await directusRequest('/items/Product_ImagesV1');
        if (existingImages.data && existingImages.data.length > 0) {
            console.log('🗑️ Limpando imagens existentes...');
            for (const image of existingImages.data) {
                await directusRequest(`/items/Product_ImagesV1/${image.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhuma imagem existente para limpar');
    }
    
    // Coletar todas as imagens
    const allImages = [];
    categories.forEach(category => {
        if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                if (product.images && product.images.length > 0) {
                    product.images.forEach(image => {
                        allImages.push({
                            image: image.image,
                            image_url: image.image_url,
                            position: image.position,
                            external_id: image.id,
                            product_id: productMap[product.id]
                        });
                    });
                }
            });
        }
    });
    
    if (allImages.length === 0) {
        console.log('⚠️ Nenhuma imagem encontrada para inserir');
        return [];
    }
    
    // Inserir imagens em lotes
    const batchSize = 100;
    const insertedImages = [];
    
    for (let i = 0; i < allImages.length; i += batchSize) {
        const batch = allImages.slice(i, i + batchSize);
        try {
            const result = await directusRequest('/items/Product_ImagesV1', 'POST', batch);
            insertedImages.push(...(Array.isArray(result.data) ? result.data : [result.data]));
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} imagens inseridas`);
        } catch (error) {
            console.error(`❌ Erro no lote de imagens:`, error.message);
        }
    }
    
    console.log(`✅ Total de ${insertedImages.length} imagens inseridas`);
    return insertedImages;
}

// Função para popular variantes dos produtos
async function populateProductVariants(categories, directusProducts) {
    console.log('🔄 Populando variantes dos produtos...');
    
    // Criar mapeamento de external_id para id do Directus
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
    // Limpar variantes existentes
    try {
        const existingVariants = await directusRequest('/items/Product_VariantsV1');
        if (existingVariants.data && existingVariants.data.length > 0) {
            console.log('🗑️ Limpando variantes existentes...');
            for (const variant of existingVariants.data) {
                await directusRequest(`/items/Product_VariantsV1/${variant.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhuma variante existente para limpar');
    }
    
    // Coletar todas as variantes
    const allVariants = [];
    categories.forEach(category => {
        if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                if (product.product_variants && product.product_variants.length > 0) {
                    product.product_variants.forEach(variant => {
                        allVariants.push({
                            name: variant.name,
                            cost: variant.cost || 0,
                            price: variant.price,
                            original_price: variant.original_price,
                            stock: variant.stock || 0,
                            external_id: variant.id,
                            product_id: productMap[product.id]
                        });
                    });
                }
            });
        }
    });
    
    if (allVariants.length === 0) {
        console.log('⚠️ Nenhuma variante encontrada para inserir');
        return [];
    }
    
    // Inserir variantes em lotes
    const batchSize = 100;
    const insertedVariants = [];
    
    for (let i = 0; i < allVariants.length; i += batchSize) {
        const batch = allVariants.slice(i, i + batchSize);
        try {
            const result = await directusRequest('/items/Product_VariantsV1', 'POST', batch);
            insertedVariants.push(...(Array.isArray(result.data) ? result.data : [result.data]));
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} variantes inseridas`);
        } catch (error) {
            console.error(`❌ Erro no lote de variantes:`, error.message);
        }
    }
    
    console.log(`✅ Total de ${insertedVariants.length} variantes inseridas`);
    return insertedVariants;
}

// Função para popular categorias de modificadores
async function populateModifierCategories(categories, directusProducts) {
    console.log('🔄 Populando categorias de modificadores...');
    
    // Criar mapeamento de external_id para id do Directus
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
    // Limpar categorias de modificadores existentes
    try {
        const existingModCategories = await directusRequest('/items/Modifier_CategoriesV1');
        if (existingModCategories.data && existingModCategories.data.length > 0) {
            console.log('🗑️ Limpando categorias de modificadores existentes...');
            for (const modCat of existingModCategories.data) {
                await directusRequest(`/items/Modifier_CategoriesV1/${modCat.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhuma categoria de modificador existente para limpar');
    }
    
    // Coletar todas as categorias de modificadores
    const allModifierCategories = [];
    categories.forEach(category => {
        if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                if (product.modifier_categories && product.modifier_categories.length > 0) {
                    product.modifier_categories.forEach(modCategory => {
                        allModifierCategories.push({
                            name: modCategory.name,
                            min_modifiers: modCategory.min_modifiers || 0,
                            max_modifiers: modCategory.max_modifiers || 1,
                            type: modCategory.type,
                            required: modCategory.required || false,
                            external_id: modCategory.id,
                            product_id: productMap[product.id]
                        });
                    });
                }
            });
        }
    });
    
    if (allModifierCategories.length === 0) {
        console.log('⚠️ Nenhuma categoria de modificador encontrada para inserir');
        return [];
    }
    
    // Inserir categorias de modificadores
    const insertedModCategories = [];
    
    for (const modCategory of allModifierCategories) {
        try {
            const result = await directusRequest('/items/Modifier_CategoriesV1', 'POST', modCategory);
            insertedModCategories.push(result.data);
        } catch (error) {
            console.error(`❌ Erro ao inserir categoria de modificador ${modCategory.name}:`, error.message);
        }
    }
    
    console.log(`✅ Total de ${insertedModCategories.length} categorias de modificadores inseridas`);
    return insertedModCategories;
}

// Função para popular modificadores
async function populateModifiers(categories, directusModifierCategories) {
    console.log('🔄 Populando modificadores...');
    
    // Criar mapeamento de external_id para id do Directus
    const modifierCategoryMap = {};
    directusModifierCategories.forEach(modCat => {
        modifierCategoryMap[modCat.external_id] = modCat.id;
    });
    
    // Limpar modificadores existentes
    try {
        const existingModifiers = await directusRequest('/items/ModifiersV1');
        if (existingModifiers.data && existingModifiers.data.length > 0) {
            console.log('🗑️ Limpando modificadores existentes...');
            for (const modifier of existingModifiers.data) {
                await directusRequest(`/items/ModifiersV1/${modifier.id}`, 'DELETE');
            }
        }
    } catch (error) {
        console.log('ℹ️ Nenhum modificador existente para limpar');
    }
    
    // Coletar todos os modificadores
    const allModifiers = [];
    categories.forEach(category => {
        if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                if (product.modifier_categories && product.modifier_categories.length > 0) {
                    product.modifier_categories.forEach(modCategory => {
                        if (modCategory.modifiers && modCategory.modifiers.length > 0) {
                            modCategory.modifiers.forEach(modifier => {
                                allModifiers.push({
                                    name: modifier.name,
                                    price: modifier.price || 0,
                                    position: modifier.position || 0,
                                    external_id: modifier.id,
                                    modifier_category_id: modifierCategoryMap[modCategory.id]
                                });
                            });
                        }
                    });
                }
            });
        }
    });
    
    if (allModifiers.length === 0) {
        console.log('⚠️ Nenhum modificador encontrado para inserir');
        return [];
    }
    
    // Inserir modificadores em lotes
    const batchSize = 100;
    const insertedModifiers = [];
    
    for (let i = 0; i < allModifiers.length; i += batchSize) {
        const batch = allModifiers.slice(i, i + batchSize);
        try {
            const result = await directusRequest('/items/ModifiersV1', 'POST', batch);
            insertedModifiers.push(...(Array.isArray(result.data) ? result.data : [result.data]));
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} modificadores inseridos`);
        } catch (error) {
            console.error(`❌ Erro no lote de modificadores:`, error.message);
        }
    }
    
    console.log(`✅ Total de ${insertedModifiers.length} modificadores inseridos`);
    return insertedModifiers;
}

// Função para exibir estatísticas finais
async function showStatistics() {
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('========================');
    
    try {
        const categories = await directusRequest('/items/CategoriesV1');
        console.log(`📁 Categorias: ${categories.data?.length || 0}`);
        
        const products = await directusRequest('/items/ProductsV1');
        console.log(`📦 Produtos: ${products.data?.length || 0}`);
        
        const images = await directusRequest('/items/Product_ImagesV1');
        console.log(`🖼️ Imagens: ${images.data?.length || 0}`);
        
        const variants = await directusRequest('/items/Product_VariantsV1');
        console.log(`💰 Variantes: ${variants.data?.length || 0}`);
        
        const modifierCategories = await directusRequest('/items/Modifier_CategoriesV1');
        console.log(`🏷️ Categorias de Modificadores: ${modifierCategories.data?.length || 0}`);
        
        const modifiers = await directusRequest('/items/ModifiersV1');
        console.log(`🎨 Modificadores: ${modifiers.data?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error.message);
    }
}

// Função principal
async function main() {
    try {
        console.log('🚀 INICIANDO POPULAÇÃO DO DIRECTUS');
        console.log('===================================\n');
        
        // 1. Buscar dados da API OlaClick
        const olaClickData = await fetchOlaClickData();
        
        // 2. Popular categorias
        const directusCategories = await populateCategories(olaClickData);
        
        // 3. Popular produtos
        const directusProducts = await populateProducts(olaClickData, directusCategories);
        
        // 4. Popular imagens dos produtos (se a collection existir)
        try {
            await populateProductImages(olaClickData, directusProducts);
        } catch (error) {
            console.log('⚠️ Collection Product_ImagesV1 não encontrada, pulando imagens');
        }
        
        // 5. Popular variantes dos produtos (se a collection existir)
        try {
            await populateProductVariants(olaClickData, directusProducts);
        } catch (error) {
            console.log('⚠️ Collection Product_VariantsV1 não encontrada, pulando variantes');
        }
        
        // 6. Popular categorias de modificadores (se a collection existir)
        let directusModifierCategories = [];
        try {
            directusModifierCategories = await populateModifierCategories(olaClickData, directusProducts);
        } catch (error) {
            console.log('⚠️ Collection Modifier_CategoriesV1 não encontrada, pulando categorias de modificadores');
        }
        
        // 7. Popular modificadores (se a collection existir)
        try {
            await populateModifiers(olaClickData, directusModifierCategories);
        } catch (error) {
            console.log('⚠️ Collection ModifiersV1 não encontrada, pulando modificadores');
        }
        
        // 8. Exibir estatísticas finais
        await showStatistics();
        
        console.log('\n✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('===================================');
        
    } catch (error) {
        console.error('\n❌ ERRO DURANTE A POPULAÇÃO:', error.message);
        console.error('===================================');
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    main,
    fetchOlaClickData,
    populateCategories,
    populateProducts,
    populateProductImages,
    populateProductVariants,
    populateModifierCategories,
    populateModifiers
};
