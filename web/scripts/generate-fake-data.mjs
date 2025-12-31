import { MongoClient } from 'mongodb';
import crypto from 'crypto';

// Function to generate random Ethereum address
function generateAddress() {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

// Function to generate random role
function generateRole() {
  const roles = [
    'ADMIN_ROLE',
    'MANUFACTURER_ROLE',
    'DISTRIBUTOR_ROLE',
    'RETAILER_ROLE',
    'CONSUMER_ROLE',
    'LOGISTICS_ROLE',
    'QUALITY_CONTROL_ROLE',
    'REGULATORY_COMPLIANCE_ROLE'
  ];
  return roles[Math.floor(Math.random() * roles.length)];
}

// Function to generate random netbook
function generateNetbook() {
  const manufacturers = ['TechCorp', 'GlobalPC', 'SmartDevices Inc', 'ElectroTech', 'FutureSystems'];
  const models = ['X100', 'ProBook 200', 'UltraNote 300', 'PowerMax 400', 'EcoBook 500'];
  
  return {
    serialNumber: 'NTB-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    model: models[Math.floor(Math.random() * models.length)],
    productionDate: new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365 * 2) // Up to 2 years ago
    ).toISOString(),
    status: ['production', 'distribution', 'retail', 'sold'][Math.floor(Math.random() * 4)],
    ownerAddress: generateAddress(),
    specs: {
      processor: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen 3', 'AMD Ryzen 5'][Math.floor(Math.random() * 5)],
      ram: [4, 8, 16, 32][Math.floor(Math.random() * 4)] + 'GB',
      storage: [128, 256, 512, 1024][Math.floor(Math.random() * 4)] + 'GB SSD',
      display: [11.6, 13.3, 14.0, 15.6][Math.floor(Math.random() * 4)] + '"'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function generateFakeData() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('supplychain-tracker');
    
    // Generate 3000 role data entries
    const roleData = [];
    const addresses = new Set();
    
    // Generate unique addresses
    while (addresses.size < 3000) {
      addresses.add(generateAddress());
    }
    
    console.log('Generating role data...');
    for (const address of addresses) {
      roleData.push({
        address: address,
        role: generateRole(),
        assignedAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365) // Up to 1 year ago
        ).toISOString(),
        status: 'active',
        metadata: {
          lastLogin: new Date(
            Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30) // Up to 30 days ago
          ).toISOString(),
          loginCount: Math.floor(Math.random() * 100),
          ipAddresses: [
            `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
          ]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Insert role data
    const roleResult = await db.collection('role_data').insertMany(roleData);
    console.log(`Inserted ${roleResult.insertedCount} role data entries`);
    
    // Generate 3000 netbook entries
    const netbookData = [];
    
    console.log('Generating netbook data...');
    for (let i = 0; i < 3000; i++) {
      netbookData.push(generateNetbook());
    }
    
    // Insert netbook data
    const netbookResult = await db.collection('netbook_data').insertMany(netbookData);
    console.log(`Inserted ${netbookResult.insertedCount} netbook entries`);
    
    console.log('Fake data generation completed successfully!');
  } catch (error) {
    console.error('Error generating fake data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

generateFakeData();