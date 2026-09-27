import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../data/db.json');

const defaultData = {
  users: [],
  categories: [],
  items: [],
  borrowRequests: [],
  reviews: [],
  notifications: [],
  wishlists: [],
  messages: []
};

class Storage {
  constructor() {
    this.data = { ...defaultData };
    this.load();
    if (this.data.users.length === 0) {
      this.seed();
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = { ...defaultData, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.log('No existing DB, using default');
      this.data = { ...defaultData };
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Failed to save DB', e);
    }
  }

  async seed() {
    console.log('🌱 Seeding database...');
    const hashedAdmin = await bcrypt.hash('Admin@123', 10);
    const hashedDemo = await bcrypt.hash('Demo@123', 10);
    const hashedUser = await bcrypt.hash('User@123', 10);

    const adminId = uuidv4();
    const demoId = uuidv4();
    const aliceId = uuidv4();
    const bobId = uuidv4();

    this.data.users = [
      {
        id: adminId,
        name: 'Alex Morgan',
        email: 'admin@borrowbox.com',
        password: hashedAdmin,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        role: 'admin',
        bio: 'BorrowBox Admin & Community Manager. Passionate about sustainable sharing economy.',
        location: 'San Francisco, CA',
        rating: 5.0,
        totalLends: 156,
        totalBorrows: 89,
        verified: true,
        joinedAt: new Date(Date.now() - 1000*60*60*24*400).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: demoId,
        name: 'Jordan Lee',
        email: 'demo@borrowbox.com',
        password: hashedDemo,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        role: 'user',
        bio: 'DIY enthusiast. I love lending my tools to neighbors! 🔧',
        location: 'Mission District, SF',
        rating: 4.9,
        totalLends: 42,
        totalBorrows: 28,
        verified: true,
        joinedAt: new Date(Date.now() - 1000*60*60*24*200).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: aliceId,
        name: 'Alice Chen',
        email: 'alice@example.com',
        password: hashedUser,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        role: 'user',
        bio: 'Book lover & photographer. Always happy to share!',
        location: 'Noe Valley, SF - 0.3 miles',
        rating: 4.8,
        totalLends: 31,
        totalBorrows: 52,
        verified: true,
        joinedAt: new Date(Date.now() - 1000*60*60*24*150).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: bobId,
        name: 'Bob Williams',
        email: 'bob@example.com',
        password: hashedUser,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        role: 'user',
        bio: 'Outdoor gear collector. Let’s make adventure accessible!',
        location: 'Sunset, SF - 1.2 miles',
        rating: 4.7,
        totalLends: 27,
        totalBorrows: 19,
        verified: true,
        joinedAt: new Date(Date.now() - 1000*60*60*24*90).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    this.data.categories = [
      { id: uuidv4(), name: 'Tools', slug: 'tools', icon: '🔧', color: '#8B5CF6', description: 'Power tools, hand tools, gardening', itemCount: 0 },
      { id: uuidv4(), name: 'Electronics', slug: 'electronics', icon: '💻', color: '#06B6D4', description: 'Cameras, drones, gadgets', itemCount: 0 },
      { id: uuidv4(), name: 'Books', slug: 'books', icon: '📚', color: '#F59E0B', description: 'Fiction, non-fiction, textbooks', itemCount: 0 },
      { id: uuidv4(), name: 'Outdoor', slug: 'outdoor', icon: '🏕️', color: '#10B981', description: 'Camping, hiking, sports', itemCount: 0 },
      { id: uuidv4(), name: 'Home', slug: 'home', icon: '🏠', color: '#EF4444', description: 'Kitchen, furniture, decor', itemCount: 0 },
      { id: uuidv4(), name: 'Party', slug: 'party', icon: '🎉', color: '#EC4899', description: 'Decorations, speakers, games', itemCount: 0 },
      { id: uuidv4(), name: 'Clothing', slug: 'clothing', icon: '👗', color: '#6366F1', description: 'Costumes, formal wear', itemCount: 0 },
      { id: uuidv4(), name: 'Sports', slug: 'sports', icon: '⚽', color: '#84CC16', description: 'Equipment, gear', itemCount: 0 }
    ];

    const getCat = (slug) => this.data.categories.find(c => c.slug === slug);

    this.data.items = [
      {
        id: uuidv4(),
        title: 'DeWalt 20V Cordless Drill Kit',
        description: 'Professional-grade cordless drill with 2 batteries, charger, and carrying case. Perfect for any DIY project. Barely used, like new condition. Includes drill bits set.',
        category: 'Tools',
        categoryId: getCat('tools').id,
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
        ],
        ownerId: demoId,
        condition: 'Like New',
        value: 199,
        lendingFee: 0,
        availability: 'available',
        location: 'Mission District, SF - 0.2 miles',
        tags: ['power-tools', 'diy', 'dewalt'],
        rating: 4.9,
        reviewCount: 12,
        borrowCount: 8,
        featured: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*5).toISOString()
      },
      {
        id: uuidv4(),
        title: 'Sony A7III Mirrorless Camera',
        description: 'Full-frame mirrorless camera with 28-70mm lens. Ideal for events, portraits, travel. Comes with extra battery, 64GB SD card, and camera bag. Professional quality.',
        category: 'Electronics',
        categoryId: getCat('electronics').id,
        images: [
          'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800',
          'https://images.unsplash.com/photo-1452780212940-6f5c84d7fa94?w=800'
        ],
        ownerId: aliceId,
        condition: 'Good',
        value: 1800,
        lendingFee: 25,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['camera', 'photography', 'sony'],
        rating: 5.0,
        reviewCount: 18,
        borrowCount: 15,
        featured: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*2).toISOString()
      },
      {
        id: uuidv4(),
        title: 'Complete Camping Set - 4 Person',
        description: 'Everything you need for camping: 4-person tent, sleeping bags x4, camping stove, lantern, chairs. Used once, excellent condition. Great for weekend getaway!',
        category: 'Outdoor',
        categoryId: getCat('outdoor').id,
        images: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
        ],
        ownerId: bobId,
        condition: 'Good',
        value: 450,
        lendingFee: 15,
        availability: 'available',
        location: 'Sunset, SF - 1.2 miles',
        tags: ['camping', 'tent', 'outdoor'],
        rating: 4.8,
        reviewCount: 9,
        borrowCount: 6,
        featured: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*1).toISOString()
      },
      {
        id: uuidv4(),
        title: 'Rare First Edition Books Collection',
        description: 'Collection of 15 rare first edition classics including Hemingway, Fitzgerald. Handle with care. For reading, not resale. Climate-controlled storage.',
        category: 'Books',
        categoryId: getCat('books').id,
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'
        ],
        ownerId: aliceId,
        condition: 'Good',
        value: 800,
        lendingFee: 0,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['rare', 'classic', 'literature'],
        rating: 5.0,
        reviewCount: 22,
        borrowCount: 11,
        featured: false,
        createdAt: new Date(Date.now() - 1000*60*60*24*7).toISOString()
      },
      {
        id: uuidv4(),
        title: 'KitchenAid Stand Mixer - Empire Red',
        description: '5-quart stand mixer, barely used. Includes whisk, dough hook, flat beater. Perfect for baking season! Easy to clean.',
        category: 'Home',
        categoryId: getCat('home').id,
        images: [
          'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=800'
        ],
        ownerId: demoId,
        condition: 'Like New',
        value: 499,
        lendingFee: 0,
        availability: 'borrowed',
        location: 'Mission District, SF - 0.2 miles',
        tags: ['kitchen', 'baking', 'mixer'],
        rating: 4.9,
        reviewCount: 14,
        borrowCount: 9,
        featured: false,
        createdAt: new Date(Date.now() - 1000*60*60*24*3).toISOString()
      },
      {
        id: uuidv4(),
        title: 'DJ Controller - Pioneer DDJ-400',
        description: 'Beginner-friendly DJ controller. Perfect for parties! Includes laptop stand and headphones. I can give quick tutorial.',
        category: 'Party',
        categoryId: getCat('party').id,
        images: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
        ],
        ownerId: bobId,
        condition: 'Good',
        value: 300,
        lendingFee: 20,
        availability: 'available',
        location: 'Sunset, SF - 1.2 miles',
        tags: ['dj', 'music', 'party'],
        rating: 4.7,
        reviewCount: 7,
        borrowCount: 12,
        featured: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*4).toISOString()
      },
      {
        id: uuidv4(),
        title: 'Mountain Bike - Trek Fuel EX 9.9',
        description: 'High-end full suspension mountain bike, size M. Carbon frame. Recently serviced. Helmet and lock included. For experienced riders.',
        category: 'Sports',
        categoryId: getCat('sports').id,
        images: [
          'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
          'https://images.unsplash.com/photo-1484156818044-c0402b43b4ad?w=800'
        ],
        ownerId: demoId,
        condition: 'Good',
        value: 3200,
        lendingFee: 30,
        availability: 'available',
        location: 'Mission District, SF - 0.2 miles',
        tags: ['bike', 'mountain', 'sports'],
        rating: 4.9,
        reviewCount: 16,
        borrowCount: 10,
        featured: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*6).toISOString()
      },
      {
        id: uuidv4(),
        title: 'Designer Costume Collection - Gala Ready',
        description: 'Stunning collection of designer dresses and suits for galas, weddings. Sizes 4-8. Dry cleaned after each use. Accessories included.',
        category: 'Clothing',
        categoryId: getCat('clothing').id,
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
        ],
        ownerId: aliceId,
        condition: 'Like New',
        value: 1200,
        lendingFee: 35,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['designer', 'formal', 'gala'],
        rating: 5.0,
        reviewCount: 19,
        borrowCount: 21,
        featured: false,
        createdAt: new Date(Date.now() - 1000*60*60*24*8).toISOString()
      }
    ];

    // Update category counts
    this.data.categories.forEach(cat => {
      cat.itemCount = this.data.items.filter(i => i.categoryId === cat.id).length;
    });

    this.data.borrowRequests = [
      {
        id: uuidv4(),
        itemId: this.data.items[0].id,
        borrowerId: aliceId,
        ownerId: demoId,
        status: 'pending',
        startDate: new Date(Date.now() + 1000*60*60*24*1).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1000*60*60*24*4).toISOString().split('T')[0],
        message: 'Hi! Need the drill for a bookshelf project this weekend. Can pickup Friday evening?',
        totalFee: 0,
        createdAt: new Date(Date.now() - 1000*60*60*5).toISOString()
      },
      {
        id: uuidv4(),
        itemId: this.data.items[4].id,
        borrowerId: aliceId,
        ownerId: demoId,
        status: 'borrowed',
        startDate: new Date(Date.now() - 1000*60*60*24*2).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1000*60*60*24*2).toISOString().split('T')[0],
        message: 'Baking a birthday cake!',
        ownerMessage: 'Enjoy! Clean after use please.',
        totalFee: 0,
        createdAt: new Date(Date.now() - 1000*60*60*24*3).toISOString()
      }
    ];

    this.data.reviews = [
      {
        id: uuidv4(),
        itemId: this.data.items[0].id,
        reviewerId: aliceId,
        revieweeId: demoId,
        rating: 5,
        comment: 'Amazing drill, Jordan was super helpful and friendly! Returned in perfect condition.',
        type: 'item',
        createdAt: new Date(Date.now() - 1000*60*60*24*10).toISOString()
      },
      {
        id: uuidv4(),
        itemId: this.data.items[1].id,
        reviewerId: bobId,
        revieweeId: aliceId,
        rating: 5,
        comment: 'Camera was pristine, Alice gave great tips. Captured my sister wedding beautifully!',
        type: 'item',
        createdAt: new Date(Date.now() - 1000*60*60*24*15).toISOString()
      }
    ];

    this.data.notifications = [
      {
        id: uuidv4(),
        userId: demoId,
        type: 'borrow_request',
        title: 'New Borrow Request',
        message: 'Alice Chen wants to borrow your DeWalt Drill Kit',
        relatedId: this.data.borrowRequests[0].id,
        read: false,
        createdAt: new Date(Date.now() - 1000*60*60*2).toISOString()
      },
      {
        id: uuidv4(),
        userId: aliceId,
        type: 'request_approved',
        title: 'Request Approved! 🎉',
        message: 'Your request for KitchenAid Mixer was approved',
        relatedId: this.data.borrowRequests[1].id,
        read: true,
        createdAt: new Date(Date.now() - 1000*60*60*24*3).toISOString()
      }
    ];

    this.data.wishlists = [
      { id: uuidv4(), userId: aliceId, itemId: this.data.items[0].id, createdAt: new Date().toISOString() },
      { id: uuidv4(), userId: demoId, itemId: this.data.items[1].id, createdAt: new Date().toISOString() }
    ];

    this.data.messages = [
      {
        id: uuidv4(),
        conversationId: `${demoId}_${aliceId}`,
        senderId: aliceId,
        receiverId: demoId,
        itemId: this.data.items[0].id,
        text: 'Hi! Is the drill still available for weekend?',
        createdAt: new Date(Date.now() - 1000*60*30).toISOString()
      },
      {
        id: uuidv4(),
        conversationId: `${demoId}_${aliceId}`,
        senderId: demoId,
        receiverId: aliceId,
        itemId: this.data.items[0].id,
        text: 'Yes! Available. You can pick up Friday after 6pm from my place.',
        createdAt: new Date(Date.now() - 1000*60*20).toISOString()
      }
    ];

    this.save();
    console.log('✅ Database seeded with demo data');
  }

  // Generic CRUD
  find(collection, predicate) {
    return this.data[collection].filter(predicate);
  }
  findOne(collection, predicate) {
    return this.data[collection].find(predicate);
  }
  findById(collection, id) {
    return this.data[collection].find(item => item.id === id);
  }
  create(collection, doc) {
    const newDoc = { id: uuidv4(), ...doc, createdAt: new Date().toISOString() };
    this.data[collection].push(newDoc);
    this.save();
    return newDoc;
  }
  update(collection, id, updates) {
    const idx = this.data[collection].findIndex(item => item.id === id);
    if (idx === -1) return null;
    this.data[collection][idx] = { ...this.data[collection][idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data[collection][idx];
  }
  delete(collection, id) {
    const idx = this.data[collection].findIndex(item => item.id === id);
    if (idx === -1) return false;
    this.data[collection].splice(idx, 1);
    this.save();
    return true;
  }
}

const storage = new Storage();
export default storage;
