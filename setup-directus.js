const fetch = require('node-fetch');

// Configuração do Directus (você precisa ajustar essas variáveis)
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'your-admin-token';

const headers = {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
};

// Função para fazer requisições ao Directus
async function directusRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
    };
    
    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
        console.error(`Error ${method} ${endpoint}:`, result);
        throw new Error(result.errors?.[0]?.message || 'Request failed');
    }
    
    return result;
}

// Função para buscar dados da API OlaClick
async function fetchOlaClickData() {
    const response = await fetch('https://api2.olaclick.app/ms-products/public/companies/43da3645-d217-4757-9dd4-4633fe4ae976/categories', {
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
            'origin': 'https://ezpods.ola.click',
            'referer': 'https://ezpods.ola.click/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }
    });
    
    return await response.json();
}

// Criar collection Categories
async function createCategoriesCollection() {
    console.log('Creating Categories collection...');
    
    const collection = {
        collection: 'categories',
        meta: {
            display_template: '{{name}}',
            sort_field: 'position'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'name',
                type: 'string',
                meta: {
                    interface: 'input',
                    required: true
                }
            },
            {
                field: 'description',
                type: 'text',
                meta: {
                    interface: 'textarea'
                }
            },
            {
                field: 'image',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'visible',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar collection Products
async function createProductsCollection() {
    console.log('Creating Products collection...');
    
    const collection = {
        collection: 'products',
        meta: {
            display_template: '{{name}}'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'name',
                type: 'string',
                meta: {
                    interface: 'input',
                    required: true
                }
            },
            {
                field: 'description',
                type: 'text',
                meta: {
                    interface: 'textarea'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'visible',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'stock_enabled',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'messages_for_customers',
                type: 'text',
                meta: {
                    interface: 'textarea'
                }
            },
            {
                field: 'kitchen_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'product_category_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar collection Product_Images
async function createProductImagesCollection() {
    console.log('Creating Product_Images collection...');
    
    const collection = {
        collection: 'product_images',
        meta: {
            display_template: '{{image}}'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'image',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'image_url',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar collection Product_Variants
async function createProductVariantsCollection() {
    console.log('Creating Product_Variants collection...');
    
    const collection = {
        collection: 'product_variants',
        meta: {
            display_template: '{{name}} - {{price}}'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'name',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'cost',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'price',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'original_price',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'packaging_price',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'sku',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'stock',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'stock_threshold',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar collection Modifier_Categories
async function createModifierCategoriesCollection() {
    console.log('Creating Modifier_Categories collection...');
    
    const collection = {
        collection: 'modifier_categories',
        meta: {
            display_template: '{{name}}'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'name',
                type: 'string',
                meta: {
                    interface: 'input',
                    required: true
                }
            },
            {
                field: 'min_modifiers',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'max_modifiers',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'type',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'One', value: 'one' },
                            { text: 'Many', value: 'many' }
                        ]
                    }
                }
            },
            {
                field: 'is_active',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'required',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar collection Modifiers
async function createModifiersCollection() {
    console.log('Creating Modifiers collection...');
    
    const collection = {
        collection: 'modifiers',
        meta: {
            display_template: '{{name}} - {{price}}'
        },
        fields: [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'name',
                type: 'string',
                meta: {
                    interface: 'input',
                    required: true
                }
            },
            {
                field: 'cost',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'price',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'original_price',
                type: 'decimal',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'sku',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'position',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'max_limit',
                type: 'integer',
                meta: {
                    interface: 'input'
                }
            },
            {
                field: 'visible',
                type: 'boolean',
                meta: {
                    interface: 'boolean'
                }
            },
            {
                field: 'external_id',
                type: 'string',
                meta: {
                    interface: 'input'
                }
            }
        ]
    };
    
    return await directusRequest('/collections', 'POST', collection);
}

// Criar relacionamentos
async function createRelationships() {
    console.log('Creating relationships...');
    
    // Relacionamento Products -> Categories (Many-to-One)
    await directusRequest('/relations', 'POST', {
        collection: 'products',
        field: 'category_id',
        related_collection: 'categories'
    });
    
    // Relacionamento Product_Images -> Products (Many-to-One)
    await directusRequest('/relations', 'POST', {
        collection: 'product_images',
        field: 'product_id',
        related_collection: 'products'
    });
    
    // Relacionamento Product_Variants -> Products (Many-to-One)
    await directusRequest('/relations', 'POST', {
        collection: 'product_variants',
        field: 'product_id',
        related_collection: 'products'
    });
    
    // Relacionamento Modifier_Categories -> Products (Many-to-One)
    await directusRequest('/relations', 'POST', {
        collection: 'modifier_categories',
        field: 'product_id',
        related_collection: 'products'
    });
    
    // Relacionamento Modifiers -> Modifier_Categories (Many-to-One)
    await directusRequest('/relations', 'POST', {
        collection: 'modifiers',
        field: 'modifier_category_id',
        related_collection: 'modifier_categories'
    });
}

// Popular dados da API OlaClick
async function populateData() {
    console.log('Fetching data from OlaClick API...');
    const olaData = await fetchOlaClickData();
    
    if (!olaData.success || !olaData.data) {
        throw new Error('Failed to fetch data from OlaClick API');
    }
    
    console.log('Populating categories and products...');
    
    for (const category of olaData.data) {
        // Inserir categoria
        const categoryData = {
            name: category.name,
            description: category.description,
            image: category.image,
            position: category.position,
            visible: category.visible,
            external_id: category.id
        };
        
        const createdCategory = await directusRequest('/items/categories', 'POST', categoryData);
        console.log(`Created category: ${category.name}`);
        
        // Inserir produtos da categoria
        for (const product of category.products || []) {
            const productData = {
                name: product.name,
                description: product.description,
                position: product.position,
                visible: product.visible,
                stock_enabled: product.stock_enabled,
                messages_for_customers: product.messages_for_customers,
                kitchen_id: product.kitchen_id,
                external_id: product.id,
                product_category_id: product.product_category_id,
                category_id: createdCategory.data.id
            };
            
            const createdProduct = await directusRequest('/items/products', 'POST', productData);
            console.log(`  Created product: ${product.name}`);
            
            // Inserir imagens do produto
            for (const image of product.images || []) {
                const imageData = {
                    image: image.image,
                    image_url: image.image_url,
                    position: image.position,
                    external_id: image.id,
                    product_id: createdProduct.data.id
                };
                
                await directusRequest('/items/product_images', 'POST', imageData);
            }
            
            // Inserir variantes do produto
            for (const variant of product.product_variants || []) {
                const variantData = {
                    name: variant.name,
                    cost: variant.cost,
                    price: variant.price,
                    original_price: variant.original_price,
                    packaging_price: variant.packaging_price,
                    sku: variant.sku,
                    stock: variant.stock,
                    stock_threshold: variant.stock_threshold,
                    position: variant.position,
                    external_id: variant.id,
                    product_id: createdProduct.data.id
                };
                
                await directusRequest('/items/product_variants', 'POST', variantData);
            }
            
            // Inserir categorias de modificadores
            for (const modCategory of product.modifier_categories || []) {
                const modCategoryData = {
                    name: modCategory.name,
                    min_modifiers: modCategory.min_modifiers,
                    max_modifiers: modCategory.max_modifiers,
                    type: modCategory.type,
                    is_active: modCategory.is_active,
                    required: modCategory.required,
                    position: modCategory.position,
                    external_id: modCategory.id,
                    product_id: createdProduct.data.id
                };
                
                const createdModCategory = await directusRequest('/items/modifier_categories', 'POST', modCategoryData);
                
                // Inserir modificadores
                for (const modifier of modCategory.modifiers || []) {
                    const modifierData = {
                        name: modifier.name,
                        cost: modifier.cost,
                        price: modifier.price,
                        original_price: modifier.original_price,
                        sku: modifier.sku,
                        position: modifier.position,
                        max_limit: modifier.max_limit,
                        visible: modifier.visible,
                        external_id: modifier.id,
                        modifier_category_id: createdModCategory.data.id
                    };
                    
                    await directusRequest('/items/modifiers', 'POST', modifierData);
                }
            }
        }
    }
    
    console.log('Data population completed!');
}

// Função principal
async function main() {
    try {
        console.log('Starting Directus setup...');
        
        // Criar collections
        await createCategoriesCollection();
        await createProductsCollection();
        await createProductImagesCollection();
        await createProductVariantsCollection();
        await createModifierCategoriesCollection();
        await createModifiersCollection();
        
        // Adicionar campos de relacionamento
        console.log('Adding relationship fields...');
        await directusRequest('/fields/products', 'POST', {
            field: 'category_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                display: 'related-values'
            }
        });
        
        await directusRequest('/fields/product_images', 'POST', {
            field: 'product_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                display: 'related-values'
            }
        });
        
        await directusRequest('/fields/product_variants', 'POST', {
            field: 'product_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                display: 'related-values'
            }
        });
        
        await directusRequest('/fields/modifier_categories', 'POST', {
            field: 'product_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                display: 'related-values'
            }
        });
        
        await directusRequest('/fields/modifiers', 'POST', {
            field: 'modifier_category_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                display: 'related-values'
            }
        });
        
        // Criar relacionamentos
        await createRelationships();
        
        // Popular dados
        await populateData();
        
        console.log('Setup completed successfully!');
        
    } catch (error) {
        console.error('Setup failed:', error);
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
    populateData
};
