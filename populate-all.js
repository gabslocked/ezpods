const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuração
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'your-admin-token';

// Função para executar curl
async function curlRequest(url, method = 'GET', data = null) {
    let cmd = `curl -s -X ${method} "${url}" -H "Authorization: Bearer ${DIRECTUS_TOKEN}" -H "Content-Type: application/json"`;
    
    if (data) {
        cmd += ` -d '${JSON.stringify(data)}'`;
    }
    
    try {
        const { stdout } = await execAsync(cmd);
        return JSON.parse(stdout);
    } catch (error) {
        console.error(`Erro na requisição ${method} ${url}:`, error.message);
        return null;
    }
}

// Função para buscar dados da API OlaClick
async function fetchOlaClickData() {
    console.log('🔄 Buscando dados da API OlaClick...');
    
    const cmd = `curl -s 'https://api2.olaclick.app/ms-products/public/companies/43da3645-d217-4757-9dd4-4633fe4ae976/categories' \\
        -H 'accept: application/json, text/plain, */*' \\
        -H 'accept-language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6' \\
        -H 'origin: https://ezpods.ola.click' \\
        -H 'referer: https://ezpods.ola.click/' \\
        -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'`;
    
    try {
        const { stdout } = await execAsync(cmd);
        const data = JSON.parse(stdout);
        
        if (!data.success || !data.data) {
            throw new Error('Dados inválidos da API');
        }
        
        console.log(`✅ ${data.data.length} categorias obtidas`);
        return data.data;
    } catch (error) {
        console.error('❌ Erro ao buscar dados da API OlaClick:', error.message);
        throw error;
    }
}

// Função para popular produtos
async function populateProducts(categories) {
    console.log('🔄 Populando produtos...');
    
    // Buscar categorias do Directus para mapeamento
    const directusCategories = await curlRequest(`${DIRECTUS_URL}/items/CategoriesV1`);
    if (!directusCategories || !directusCategories.data) {
        throw new Error('Erro ao buscar categorias do Directus');
    }
    
    // Criar mapeamento external_id -> id
    const categoryMap = {};
    directusCategories.data.forEach(cat => {
        categoryMap[cat.external_id] = cat.id;
    });
    
    // Coletar todos os produtos
    const allProducts = [];
    let productCount = 0;
    
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
                productCount++;
            });
        }
    });
    
    console.log(`📦 Inserindo ${productCount} produtos...`);
    
    // Inserir produtos um por vez (mais confiável)
    const insertedProducts = [];
    for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        try {
            const result = await curlRequest(`${DIRECTUS_URL}/items/ProductsV1`, 'POST', product);
            if (result && result.data) {
                insertedProducts.push(result.data);
                if ((i + 1) % 10 === 0) {
                    console.log(`✅ ${i + 1}/${allProducts.length} produtos inseridos`);
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir produto ${product.name}:`, error.message);
        }
    }
    
    console.log(`✅ Total: ${insertedProducts.length} produtos inseridos`);
    return insertedProducts;
}

// Função para popular imagens
async function populateImages(categories, directusProducts) {
    console.log('🔄 Populando imagens...');
    
    // Criar mapeamento external_id -> id
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
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
    
    console.log(`🖼️ Inserindo ${allImages.length} imagens...`);
    
    // Inserir imagens
    const insertedImages = [];
    for (let i = 0; i < allImages.length; i++) {
        const image = allImages[i];
        try {
            const result = await curlRequest(`${DIRECTUS_URL}/items/Product_ImagesV1`, 'POST', image);
            if (result && result.data) {
                insertedImages.push(result.data);
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir imagem:`, error.message);
        }
    }
    
    console.log(`✅ Total: ${insertedImages.length} imagens inseridas`);
    return insertedImages;
}

// Função para popular variantes
async function populateVariants(categories, directusProducts) {
    console.log('🔄 Populando variantes...');
    
    // Criar mapeamento external_id -> id
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
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
    
    console.log(`💰 Inserindo ${allVariants.length} variantes...`);
    
    // Inserir variantes
    const insertedVariants = [];
    for (let i = 0; i < allVariants.length; i++) {
        const variant = allVariants[i];
        try {
            const result = await curlRequest(`${DIRECTUS_URL}/items/Product_VariantsV1`, 'POST', variant);
            if (result && result.data) {
                insertedVariants.push(result.data);
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir variante:`, error.message);
        }
    }
    
    console.log(`✅ Total: ${insertedVariants.length} variantes inseridas`);
    return insertedVariants;
}

// Função para popular categorias de modificadores
async function populateModifierCategories(categories, directusProducts) {
    console.log('🔄 Populando categorias de modificadores...');
    
    // Criar mapeamento external_id -> id
    const productMap = {};
    directusProducts.forEach(prod => {
        productMap[prod.external_id] = prod.id;
    });
    
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
    
    console.log(`🏷️ Inserindo ${allModifierCategories.length} categorias de modificadores...`);
    
    // Inserir categorias de modificadores
    const insertedModCategories = [];
    for (let i = 0; i < allModifierCategories.length; i++) {
        const modCategory = allModifierCategories[i];
        try {
            const result = await curlRequest(`${DIRECTUS_URL}/items/Modifier_CategoriesV1`, 'POST', modCategory);
            if (result && result.data) {
                insertedModCategories.push(result.data);
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir categoria de modificador:`, error.message);
        }
    }
    
    console.log(`✅ Total: ${insertedModCategories.length} categorias de modificadores inseridas`);
    return insertedModCategories;
}

// Função para popular modificadores
async function populateModifiers(categories, directusModifierCategories) {
    console.log('🔄 Populando modificadores...');
    
    // Criar mapeamento external_id -> id
    const modifierCategoryMap = {};
    directusModifierCategories.forEach(modCat => {
        modifierCategoryMap[modCat.external_id] = modCat.id;
    });
    
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
    
    console.log(`🎨 Inserindo ${allModifiers.length} modificadores...`);
    
    // Inserir modificadores
    const insertedModifiers = [];
    for (let i = 0; i < allModifiers.length; i++) {
        const modifier = allModifiers[i];
        try {
            const result = await curlRequest(`${DIRECTUS_URL}/items/ModifiersV1`, 'POST', modifier);
            if (result && result.data) {
                insertedModifiers.push(result.data);
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir modificador:`, error.message);
        }
    }
    
    console.log(`✅ Total: ${insertedModifiers.length} modificadores inseridos`);
    return insertedModifiers;
}

// Função para exibir estatísticas
async function showStats() {
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('========================');
    
    try {
        const categories = await curlRequest(`${DIRECTUS_URL}/items/CategoriesV1`);
        console.log(`📁 Categorias: ${categories?.data?.length || 0}`);
        
        const products = await curlRequest(`${DIRECTUS_URL}/items/ProductsV1`);
        console.log(`📦 Produtos: ${products?.data?.length || 0}`);
        
        const images = await curlRequest(`${DIRECTUS_URL}/items/Product_ImagesV1`);
        console.log(`🖼️ Imagens: ${images?.data?.length || 0}`);
        
        const variants = await curlRequest(`${DIRECTUS_URL}/items/Product_VariantsV1`);
        console.log(`💰 Variantes: ${variants?.data?.length || 0}`);
        
        const modifierCategories = await curlRequest(`${DIRECTUS_URL}/items/Modifier_CategoriesV1`);
        console.log(`🏷️ Categorias de Modificadores: ${modifierCategories?.data?.length || 0}`);
        
        const modifiers = await curlRequest(`${DIRECTUS_URL}/items/ModifiersV1`);
        console.log(`🎨 Modificadores: ${modifiers?.data?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error.message);
    }
}

// Função principal
async function main() {
    try {
        console.log('🚀 POPULANDO DIRECTUS COM DADOS DA API OLACLICK');
        console.log('===============================================\n');
        
        // 1. Buscar dados da API OlaClick
        const olaClickData = await fetchOlaClickData();
        
        // 2. Popular produtos
        const directusProducts = await populateProducts(olaClickData);
        
        // 3. Popular imagens
        await populateImages(olaClickData, directusProducts);
        
        // 4. Popular variantes
        await populateVariants(olaClickData, directusProducts);
        
        // 5. Popular categorias de modificadores
        const directusModifierCategories = await populateModifierCategories(olaClickData, directusProducts);
        
        // 6. Popular modificadores
        await populateModifiers(olaClickData, directusModifierCategories);
        
        // 7. Exibir estatísticas
        await showStats();
        
        console.log('\n✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('===================================');
        
    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
