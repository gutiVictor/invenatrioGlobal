const { Category } = require('../models');
const { sequelize } = require('../config/database');

const categoryTree = [
  {
    name: 'Cómputo',
    code: 'COM',
    children: [
      { name: 'PC Escritorio', code: 'COM-DSK' },
      { name: 'Portátil / Laptop', code: 'COM-LAP' },
      { name: 'Tablet', code: 'COM-TAB' },
      { name: 'Servidor', code: 'COM-SRV' },
      { name: 'Componentes', code: 'COM-CMP', children: [
          { name: 'Procesadores', code: 'COM-CPU' },
          { name: 'Memoria RAM', code: 'COM-RAM' },
          { name: 'Almacenamiento SSD', code: 'COM-SSD' }
      ]},
      { name: 'Periféricos', code: 'COM-PER', children: [
          { name: 'Monitores', code: 'COM-MON' },
          { name: 'Teclados', code: 'COM-TEC' },
          { name: 'Mouse', code: 'COM-MOU' }
      ]},
      { name: 'Redes / Conectividad', code: 'COM-NET', children: [
          { name: 'Routers', code: 'COM-RUT' },
          { name: 'Switches', code: 'COM-SWI' },
          { name: 'Cables', code: 'COM-CAB' }
      ]}
    ]
  },
  {
    name: 'Oficina',
    code: 'OFI',
    children: [
      { name: 'Mobiliario', code: 'OFI-MOB', children: [
          { name: 'Sillas', code: 'OFI-SIL' },
          { name: 'Escritorios', code: 'OFI-ESC' },
          { name: 'Reguladores', code: 'OFI-REG' }
      ]},
      { name: 'Papelería / Consumibles', code: 'OFI-PAP', children: [
          { name: 'Hojas', code: 'OFI-HOJ' },
          { name: 'Bolígrafos', code: 'OFI-BOL' },
          { name: 'Clips', code: 'OFI-CLI' }
      ]},
      { name: 'Impresión', code: 'OFI-PRT', children: [
          { name: 'Impresoras', code: 'OFI-IMP' },
          { name: 'Tintas', code: 'OFI-TIN' },
          { name: 'Tóners', code: 'OFI-TON' }
      ]},
      { name: 'Comunicación', code: 'OFI-COM', children: [
          { name: 'Teléfonos Fijos', code: 'OFI-TEL' },
          { name: 'Fax', code: 'OFI-FAX' }
      ]},
      { name: 'Almacenamiento', code: 'OFI-STO', children: [
          { name: 'Archiveros', code: 'OFI-ARC' },
          { name: 'Cajas Fuertes', code: 'OFI-CAJ' }
      ]}
    ]
  },
  {
    name: 'Telefonía',
    code: 'TEC',
    children: [
      { name: 'Smartphone', code: 'TEC-PHO' },
      { name: 'Accesorios móviles', code: 'TEC-ACC', children: [
          { name: 'Cargadores', code: 'TEC-CAR' },
          { name: 'Auriculares', code: 'TEC-AUR' }
      ]}
    ]
  },
  {
    name: 'Audio / Video',
    code: 'AUD',
    children: [
      { name: 'Proyectores', code: 'AUD-PRO' },
      { name: 'Pantallas LED', code: 'AUD-LED' },
      { name: 'Cámaras web', code: 'AUD-WEB' },
      { name: 'Auriculares / Micrófonos', code: 'AUD-MIC' }
    ]
  },
  {
    name: 'Seguridad',
    code: 'SEG',
    children: [
      { name: 'Cámaras IP', code: 'SEG-CAM' },
      { name: 'Control de acceso', code: 'SEG-ACE' },
      { name: 'Alarmas', code: 'SEG-ALM' }
    ]
  },
  {
    name: 'Software',
    code: 'SOF',
    children: [
      { name: 'Licencias OS', code: 'SOF-OSS' },
      { name: 'Licencias Office', code: 'SOF-OFF' },
      { name: 'Antivirus', code: 'SOF-AV' },
      { name: 'Aplicaciones internas', code: 'SOF-APP' }
    ]
  },
  {
    name: 'Repuestos',
    code: 'REP',
    children: [
      { name: 'Fuentes de Poder', code: 'REP-PSU' },
      { name: 'Baterías', code: 'REP-BAT' }
    ]
  },
  {
    name: 'Descarte / Chatarra',
    code: 'DES',
    children: [
      { name: 'Residuos Electrónicos', code: 'DES-EEE' }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.');

    // Opcional: Limpiar categorías existentes (cuidado en producción)
    // await Category.destroy({ where: {}, truncate: true, cascade: true });

    async function createCategoryRecursive(categoryData, parentId = null, level = 0) {
      const slug = categoryData.name.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      // Check if exists to avoid duplicates
      let category = await Category.findOne({ where: { code: categoryData.code } });

      if (!category) {
        category = await Category.create({
          name: categoryData.name,
          code: categoryData.code,
          slug: slug,
          parent_id: parentId,
          level: level,
          active: true
        });
        console.log(`Created: ${category.name} (${category.code})`);
      } else {
        console.log(`Skipped (exists): ${category.name} (${category.code})`);
      }

      if (categoryData.children && categoryData.children.length > 0) {
        for (const child of categoryData.children) {
          await createCategoryRecursive(child, category.id, level + 1);
        }
      }
    }

    console.log('Seeding categories...');
    for (const rootCat of categoryTree) {
      await createCategoryRecursive(rootCat);
    }

    console.log('Category seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedCategories();
