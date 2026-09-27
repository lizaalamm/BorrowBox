import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/db.json');

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

/**
 * Demo accounts shared by the seed data, the auth demo endpoint and the docs.
 * Passwords are only used when the database is first created.
 */
export const DEMO_ACCOUNTS = [
  { role: 'admin', name: 'User 1', email: 'user1@borrowbox.com', password: 'Admin@123', description: 'Admin account with moderation access' },
  { role: 'user', name: 'User 2', email: 'user2@borrowbox.com', password: 'Demo@123', description: 'Primary member account with items' },
  { role: 'user', name: 'User 3', email: 'user3@borrowbox.com', password: 'User@123', description: 'Photographer and book lover' },
  { role: 'user', name: 'User 4', email: 'user4@borrowbox.com', password: 'User@123', description: 'Outdoor gear collector' }
];

class Storage {
  constructor() {
    this.data = { ...defaultData };
    this.load();

    /**
     * Seeding hashes passwords, so it is asynchronous. `ready` lets the server
     * bootstrap wait for the seed to finish before it accepts traffic.
     */
    this.ready = this.data.users.length === 0 ? this.seed() : Promise.resolve();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = { ...defaultData, ...JSON.parse(raw) };
      }
    } catch (error) {
      console.error('[storage] Could not read the database file, starting fresh:', error.message);
      this.data = { ...defaultData };
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('[storage] Failed to persist the database:', error.message);
    }
  }

  async seed() {
    console.log('[storage] Seeding the database with demo data...');

    const passwordHashes = {};
    for (const account of DEMO_ACCOUNTS) {
      passwordHashes[account.email] = await bcrypt.hash(account.password, 10);
    }

    const ids = Object.fromEntries(DEMO_ACCOUNTS.map((account) => [account.email, uuidv4()]));
    const now = Date.now();
    const daysAgo = (days) => new Date(now - 1000 * 60 * 60 * 24 * days).toISOString();

    const avatar = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    this.data.users = [
      {
        id: ids['user1@borrowbox.com'],
        name: 'User 1',
        email: 'user1@borrowbox.com',
        password: passwordHashes['user1@borrowbox.com'],
        avatar: avatar('user1'),
        role: 'admin',
        bio: 'BorrowBox community manager. Focused on trust, safety and keeping neighbourhood lending human.',
        location: 'San Francisco, CA',
        rating: 5,
        totalLends: 42,
        totalBorrows: 18,
        verified: true,
        joinedAt: daysAgo(400),
        createdAt: daysAgo(400)
      },
      {
        id: ids['user2@borrowbox.com'],
        name: 'User 2',
        email: 'user2@borrowbox.com',
        password: passwordHashes['user2@borrowbox.com'],
        avatar: avatar('user2'),
        role: 'user',
        bio: 'DIY enthusiast and weekend woodworker. Happy to lend tools and walk anyone through their first project.',
        location: 'Mission District, SF',
        rating: 4.9,
        totalLends: 24,
        totalBorrows: 16,
        verified: true,
        joinedAt: daysAgo(220),
        createdAt: daysAgo(220)
      },
      {
        id: ids['user3@borrowbox.com'],
        name: 'User 3',
        email: 'user3@borrowbox.com',
        password: passwordHashes['user3@borrowbox.com'],
        avatar: avatar('user3'),
        role: 'user',
        bio: 'Photographer and reader. I keep a small kit of camera gear and first edition books in circulation.',
        location: 'Noe Valley, SF',
        rating: 4.8,
        totalLends: 31,
        totalBorrows: 22,
        verified: true,
        joinedAt: daysAgo(180),
        createdAt: daysAgo(180)
      },
      {
        id: ids['user4@borrowbox.com'],
        name: 'User 4',
        email: 'user4@borrowbox.com',
        password: passwordHashes['user4@borrowbox.com'],
        avatar: avatar('user4'),
        role: 'user',
        bio: 'Outdoor gear collector. Camping, climbing and cycling equipment available most weekends.',
        location: 'Sunset, SF',
        rating: 4.7,
        totalLends: 27,
        totalBorrows: 14,
        verified: true,
        joinedAt: daysAgo(120),
        createdAt: daysAgo(120)
      }
    ];

    this.data.categories = [
      { id: uuidv4(), name: 'Tools', slug: 'tools', icon: 'wrench', color: '#4F46E5', description: 'Power tools, hand tools and gardening equipment', itemCount: 0 },
      { id: uuidv4(), name: 'Electronics', slug: 'electronics', icon: 'laptop', color: '#06B6D4', description: 'Cameras, drones and everyday gadgets', itemCount: 0 },
      { id: uuidv4(), name: 'Books', slug: 'books', icon: 'book-open', color: '#F59E0B', description: 'Fiction, non-fiction and textbooks', itemCount: 0 },
      { id: uuidv4(), name: 'Outdoor', slug: 'outdoor', icon: 'tent', color: '#10B981', description: 'Camping, hiking and climbing gear', itemCount: 0 },
      { id: uuidv4(), name: 'Home', slug: 'home', icon: 'utensils', color: '#EF4444', description: 'Kitchen appliances, furniture and decor', itemCount: 0 },
      { id: uuidv4(), name: 'Party', slug: 'party', icon: 'party-popper', color: '#EC4899', description: 'Speakers, decorations and games', itemCount: 0 },
      { id: uuidv4(), name: 'Clothing', slug: 'clothing', icon: 'shirt', color: '#6366F1', description: 'Formal wear and costumes for events', itemCount: 0 },
      { id: uuidv4(), name: 'Sports', slug: 'sports', icon: 'dumbbell', color: '#84CC16', description: 'Bikes, boards and training equipment', itemCount: 0 }
    ];

    const categoryBySlug = (slug) => this.data.categories.find((category) => category.slug === slug);

    const owner = {
      manager: ids['user1@borrowbox.com'],
      maker: ids['user2@borrowbox.com'],
      photographer: ids['user3@borrowbox.com'],
      outdoors: ids['user4@borrowbox.com']
    };

    this.data.items = [
      {
        id: uuidv4(),
        title: 'DeWalt 20V Cordless Drill Kit',
        description: 'Professional grade cordless drill with two batteries, fast charger, 30 piece bit set and a hard carry case. Excellent condition, used on three small projects.',
        category: 'Tools',
        categoryId: categoryBySlug('tools').id,
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80'
        ],
        ownerId: owner.maker,
        condition: 'Like New',
        value: 199,
        lendingFee: 0,
        availability: 'available',
        location: 'Mission District, SF - 0.2 miles',
        tags: ['power-tools', 'diy', 'dewalt'],
        rating: 4.9,
        reviewCount: 2,
        borrowCount: 8,
        featured: true,
        createdAt: daysAgo(5)
      },
      {
        id: uuidv4(),
        title: 'Sony A7 III Mirrorless Camera',
        description: 'Full frame mirrorless camera with a 28-70mm lens, spare battery, 64GB card and padded bag. Ideal for events, portraits and travel.',
        category: 'Electronics',
        categoryId: categoryBySlug('electronics').id,
        images: [
          'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=900&q=80',
          'https://images.unsplash.com/photo-1452780212940-6f5c84d7fa94?w=900&q=80'
        ],
        ownerId: owner.photographer,
        condition: 'Good',
        value: 1800,
        lendingFee: 25,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['camera', 'photography', 'sony'],
        rating: 5,
        reviewCount: 1,
        borrowCount: 15,
        featured: true,
        createdAt: daysAgo(2)
      },
      {
        id: uuidv4(),
        title: 'Complete 4 Person Camping Set',
        description: 'Four person tent, four sleeping bags, camping stove, lantern and two folding chairs. Used twice, stored dry and clean. Great for a weekend trip.',
        category: 'Outdoor',
        categoryId: categoryBySlug('outdoor').id,
        images: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=900&q=80',
          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=900&q=80'
        ],
        ownerId: owner.outdoors,
        condition: 'Good',
        value: 450,
        lendingFee: 15,
        availability: 'available',
        location: 'Sunset, SF - 1.2 miles',
        tags: ['camping', 'tent', 'outdoor'],
        rating: 4.8,
        reviewCount: 0,
        borrowCount: 6,
        featured: true,
        createdAt: daysAgo(1)
      },
      {
        id: uuidv4(),
        title: 'First Edition Classics Collection',
        description: 'Set of fifteen first edition classics including Hemingway and Fitzgerald. For reading only, kept in a climate controlled cabinet.',
        category: 'Books',
        categoryId: categoryBySlug('books').id,
        images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&q=80'],
        ownerId: owner.photographer,
        condition: 'Good',
        value: 800,
        lendingFee: 0,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['rare', 'classic', 'literature'],
        rating: 5,
        reviewCount: 0,
        borrowCount: 11,
        featured: false,
        createdAt: daysAgo(7)
      },
      {
        id: uuidv4(),
        title: 'KitchenAid Stand Mixer',
        description: 'Five quart tilt head stand mixer in empire red. Includes whisk, dough hook and flat beater. Deep cleaned after every use.',
        category: 'Home',
        categoryId: categoryBySlug('home').id,
        images: ['https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=900&q=80'],
        ownerId: owner.maker,
        condition: 'Like New',
        value: 379,
        lendingFee: 0,
        availability: 'borrowed',
        location: 'Mission District, SF - 0.2 miles',
        tags: ['kitchen', 'baking', 'mixer'],
        rating: 4.9,
        reviewCount: 0,
        borrowCount: 9,
        featured: true,
        createdAt: daysAgo(9)
      },
      {
        id: uuidv4(),
        title: 'JBL Party Speaker with Lights',
        description: 'Portable party speaker with rechargeable battery, wireless microphone input and light show. Perfect for birthdays and small events.',
        category: 'Party',
        categoryId: categoryBySlug('party').id,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&q=80'],
        ownerId: owner.manager,
        condition: 'Good',
        value: 320,
        lendingFee: 10,
        availability: 'available',
        location: 'San Francisco, CA - 0.8 miles',
        tags: ['speaker', 'party', 'music'],
        rating: 4.7,
        reviewCount: 0,
        borrowCount: 7,
        featured: false,
        createdAt: daysAgo(12)
      },
      {
        id: uuidv4(),
        title: 'Trek Mountain Bike - Size M',
        description: 'Hardtail mountain bike with 29 inch wheels, hydraulic disc brakes and a recent service. Includes helmet and lock.',
        category: 'Sports',
        categoryId: categoryBySlug('sports').id,
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&q=80'],
        ownerId: owner.outdoors,
        condition: 'Good',
        value: 950,
        lendingFee: 20,
        availability: 'available',
        location: 'Sunset, SF - 1.2 miles',
        tags: ['bike', 'mountain', 'sports'],
        rating: 4.9,
        reviewCount: 0,
        borrowCount: 10,
        featured: true,
        createdAt: daysAgo(6)
      },
      {
        id: uuidv4(),
        title: 'Designer Gala Outfit Set',
        description: 'Two formal outfits suitable for galas and weddings, sizes 4 to 8, dry cleaned after each use. Accessories included.',
        category: 'Clothing',
        categoryId: categoryBySlug('clothing').id,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80'],
        ownerId: owner.photographer,
        condition: 'Like New',
        value: 1200,
        lendingFee: 35,
        availability: 'available',
        location: 'Noe Valley, SF - 0.3 miles',
        tags: ['designer', 'formal', 'gala'],
        rating: 5,
        reviewCount: 0,
        borrowCount: 5,
        featured: false,
        createdAt: daysAgo(8)
      }
    ];

    this.data.categories.forEach((category) => {
      category.itemCount = this.data.items.filter((item) => item.categoryId === category.id).length;
    });

    const drill = this.data.items[0];
    const mixer = this.data.items[4];

    this.data.borrowRequests = [
      {
        id: uuidv4(),
        itemId: drill.id,
        borrowerId: owner.photographer,
        ownerId: owner.maker,
        status: 'pending',
        startDate: new Date(now + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
        endDate: new Date(now + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
        message: 'Building a bookshelf this weekend and need to drill pilot holes. Could I collect on Friday evening?',
        totalFee: 0,
        createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: uuidv4(),
        itemId: mixer.id,
        borrowerId: owner.photographer,
        ownerId: owner.maker,
        status: 'borrowed',
        startDate: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
        endDate: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
        message: 'Baking a birthday cake for my nephew this week.',
        ownerMessage: 'Enjoy it. A quick wipe down before returning is all I ask.',
        totalFee: 0,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString()
      }
    ];

    this.data.reviews = [
      {
        id: uuidv4(),
        itemId: drill.id,
        reviewerId: owner.photographer,
        revieweeId: owner.maker,
        rating: 5,
        comment: 'Drill was in perfect condition and the handover was easy. Clear instructions on the bits too.',
        type: 'item',
        createdAt: daysAgo(10)
      },
      {
        id: uuidv4(),
        itemId: this.data.items[1].id,
        reviewerId: owner.outdoors,
        revieweeId: owner.photographer,
        rating: 5,
        comment: 'Camera arrived spotless with everything charged. Great tips on settings for low light.',
        type: 'item',
        createdAt: daysAgo(15)
      }
    ];

    this.data.notifications = [
      {
        id: uuidv4(),
        userId: owner.maker,
        type: 'borrow_request',
        title: 'New borrow request',
        message: 'User 3 wants to borrow your DeWalt 20V Cordless Drill Kit.',
        relatedId: this.data.borrowRequests[0].id,
        read: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: uuidv4(),
        userId: owner.photographer,
        type: 'request_approved',
        title: 'Request approved',
        message: 'Your request for the KitchenAid Stand Mixer was approved.',
        relatedId: this.data.borrowRequests[1].id,
        read: true,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString()
      }
    ];

    this.data.wishlists = [
      { id: uuidv4(), userId: owner.photographer, itemId: drill.id, createdAt: new Date().toISOString() },
      { id: uuidv4(), userId: owner.maker, itemId: this.data.items[1].id, createdAt: new Date().toISOString() }
    ];

    this.data.messages = [
      {
        id: uuidv4(),
        conversationId: [owner.maker, owner.photographer].sort().join('_'),
        senderId: owner.photographer,
        receiverId: owner.maker,
        itemId: drill.id,
        text: 'Hi, is the drill still free this weekend?',
        createdAt: new Date(now - 1000 * 60 * 30).toISOString()
      },
      {
        id: uuidv4(),
        conversationId: [owner.maker, owner.photographer].sort().join('_'),
        senderId: owner.maker,
        receiverId: owner.photographer,
        itemId: drill.id,
        text: 'Yes, it is available. Friday after 6pm works well for pickup.',
        createdAt: new Date(now - 1000 * 60 * 20).toISOString()
      }
    ];

    this.save();
    console.log(`[storage] Seed complete: ${this.data.users.length} users, ${this.data.items.length} items, ${this.data.categories.length} categories.`);
  }

  /* ------------------------------------------------------------- generic CRUD */
  find(collection, predicate) {
    return this.data[collection].filter(predicate);
  }

  findOne(collection, predicate) {
    return this.data[collection].find(predicate);
  }

  findById(collection, id) {
    return this.data[collection].find((entry) => entry.id === id);
  }

  create(collection, doc) {
    const newDoc = { id: uuidv4(), ...doc, createdAt: new Date().toISOString() };
    this.data[collection].push(newDoc);
    this.save();
    return newDoc;
  }

  update(collection, id, updates) {
    const index = this.data[collection].findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = this.data[collection].findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }
}

const storage = new Storage();
export default storage;
