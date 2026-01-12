/**
 * Financial Education Content System
 * 
 * Progressive disclosure approach with 4 levels based on:
 * - Total money saved
 * - Number of transactions
 * - Time using the app
 * - Previous content completion
 */

export type ContentType = 'tip' | 'scenario' | 'quiz' | 'funfact' | 'reflection' | 'challenge' | 'celebration';
export type InteractionType = 'thumbs' | 'multiple-choice' | 'emoji' | 'yes-no' | 'slider' | 'swipe';
export type ProgressLevel = 1 | 2 | 3 | 4;

export interface LearningCard {
  id: string;
  level: ProgressLevel;
  type: ContentType;
  title: string;
  content: string;
  interactionType: InteractionType;
  interactionData?: {
    question?: string;
    options?: string[];
    correctAnswer?: number | string;
    explanation?: string;
    emojiOptions?: string[];
    sliderLabels?: { min: string; max: string };
  };
  requiresAcknowledgment: boolean;
  alternateFormats?: string[]; // IDs of alternate versions of same concept
}

export interface UserProgress {
  currentLevel: ProgressLevel;
  seenCardIds: string[];
  acknowledgedCardIds: string[];
  dismissedCardIds: string[];
  dismissedTimestamps: Record<string, number>;
  lastShownTimestamp: number;
  levelUnlockedDates: Record<number, number>;
  interactionHistory: Array<{
    cardId: string;
    timestamp: number;
    interactionType: string;
    response?: any;
  }>;
}

/**
 * Learning Content Database
 * Organized by level and topic
 */
export const LEARNING_CARDS: LearningCard[] = [
  // ==================== LEVEL 1: FOUNDATION ====================
  // For beginners: $0-$100, basic concepts
  
  {
    id: 'l1-what-is-money',
    level: 1,
    type: 'tip',
    title: '💰 What is Money?',
    content: 'Money is a tool that helps you get things you need and want. You can earn it, save it, and spend it!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Does this make sense?',
      emojiOptions: ['👍 Got it!', '🤔 Tell me more']
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l1-what-is-money-alt1']
  },
  {
    id: 'l1-what-is-money-alt1',
    level: 1,
    type: 'scenario',
    title: '💰 Money Basics',
    content: 'Imagine you help your neighbor walk their dog. They give you $5. That $5 is money you earned! Now you can save it or use it to buy something.',
    interactionType: 'thumbs',
    requiresAcknowledgment: true
  },
  {
    id: 'l1-earning-vs-receiving',
    level: 1,
    type: 'quiz',
    title: '🎁 Earning or Receiving?',
    content: 'Your grandma gives you $10 for your birthday.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Did you earn this money or receive it as a gift?',
      options: ['Earned it by working', 'Received it as a gift'],
      correctAnswer: 1,
      explanation: 'That\'s right! Birthday money is a gift. Earning means you did work for it, like chores or a job.'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l1-earning-vs-receiving-alt1']
  },
  {
    id: 'l1-earning-vs-receiving-alt1',
    level: 1,
    type: 'scenario',
    title: '💪 How Do You Get Money?',
    content: 'There are two main ways to get money: you can EARN it by doing work (like chores), or you can RECEIVE it as a gift (like birthday money). Both are okay!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Which way have you gotten money before?',
      emojiOptions: ['💼 Earned it', '🎁 Gift', '✨ Both!']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l1-needs-vs-wants',
    level: 1,
    type: 'quiz',
    title: '🤔 Need or Want?',
    content: 'A need is something you MUST have (like food). A want is something you\'d LIKE to have (like a toy).',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Which one is a NEED?',
      options: ['A video game', 'A winter jacket', 'Candy'],
      correctAnswer: 1,
      explanation: 'Exactly! A winter jacket keeps you warm and safe. Video games and candy are wants - fun but not necessary.'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l1-needs-vs-wants-alt1', 'l1-needs-vs-wants-alt2']
  },
  {
    id: 'l1-needs-vs-wants-alt1',
    level: 1,
    type: 'challenge',
    title: '🎯 Needs vs Wants Game',
    content: 'Think about the last thing you spent money on. Was it something you NEEDED (had to have) or WANTED (would like to have)?',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'What was it?',
      options: ['A need', 'A want', 'Not sure'],
      explanation: 'Great thinking! Knowing the difference helps you make smart money choices.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l1-needs-vs-wants-alt2',
    level: 1,
    type: 'reflection',
    title: '💭 Think About It',
    content: 'NEEDS keep you healthy and safe (food, clothes, home). WANTS make you happy but aren\'t required (toys, games, treats).',
    interactionType: 'emoji',
    interactionData: {
      question: 'Can you think of one need and one want?',
      emojiOptions: ['✅ Yes!', '🤷 Not sure']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l1-saving-basics',
    level: 1,
    type: 'tip',
    title: '🐷 Why Save?',
    content: 'Saving means keeping your money safe for later. When you save, you can buy bigger things or be ready for surprises!',
    interactionType: 'thumbs',
    requiresAcknowledgment: true,
    alternateFormats: ['l1-saving-basics-alt1']
  },
  {
    id: 'l1-saving-basics-alt1',
    level: 1,
    type: 'scenario',
    title: '🎮 The Power of Saving',
    content: 'You want a $30 game. If you spend your $5 allowance each week on snacks, you\'ll have no money left. But if you save it, in 6 weeks you\'ll have enough for the game!',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'What sounds like a better plan?',
      options: ['Save for the game', 'Buy snacks each week', 'A bit of both'],
      explanation: 'All answers work! What matters is making a choice that feels right for YOU.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l1-counting-money',
    level: 1,
    type: 'funfact',
    title: '🔢 Money Math',
    content: 'Did you know? If you save just $1 every day, in one year you\'ll have $365! Small amounts add up to big savings.',
    interactionType: 'emoji',
    interactionData: {
      question: 'That\'s pretty cool, right?',
      emojiOptions: ['🤩 Amazing!', '😮 Wow!', '👍 Cool']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l1-spending-choice',
    level: 1,
    type: 'reflection',
    title: '💸 Before You Spend',
    content: 'Before buying something, ask yourself: Do I really want this? Will I use it? Can I afford it?',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Will you try asking yourself these questions?'
    },
    requiresAcknowledgment: true
  },

  // ==================== LEVEL 2: BUILDING BLOCKS ====================
  // Growing: $100-$500, goal-setting and choices
  
  {
    id: 'l2-setting-goals',
    level: 2,
    type: 'tip',
    title: '🎯 Money Goals',
    content: 'A money goal is something you want to save for. It could be a toy, a trip, or just building up your savings. Having a goal makes saving more fun!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Do you have a savings goal in mind?',
      emojiOptions: ['✅ Yes!', '🤔 Maybe', '❌ Not yet']
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l2-setting-goals-alt1']
  },
  {
    id: 'l2-setting-goals-alt1',
    level: 2,
    type: 'challenge',
    title: '🎯 Pick Your Goal',
    content: 'Think of something you really want. How much does it cost? How much can you save each week? This is goal planning!',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Have you thought of a goal?',
      options: ['Yes, I have one!', 'I need help deciding', 'I\'ll think about it'],
      explanation: 'Great! Having a clear goal makes it easier to save and stay motivated.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-delayed-gratification',
    level: 2,
    type: 'scenario',
    title: '⏰ Wait for Something Better',
    content: 'You have $20. You could buy a small toy now, OR save $10 more and buy something you\'ve really wanted. Waiting is hard, but often worth it!',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'What would you do?',
      options: ['Buy the small toy now', 'Wait and save more', 'Maybe both?'],
      explanation: 'Every choice teaches you something about what matters to you!'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l2-delayed-gratification-alt1']
  },
  {
    id: 'l2-delayed-gratification-alt1',
    level: 2,
    type: 'tip',
    title: '🍪 The Cookie Test',
    content: 'Scientists found that kids who could wait for a bigger treat (2 cookies later vs 1 now) often did better with money as adults. Waiting is a superpower!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Could you wait for the bigger reward?',
      emojiOptions: ['💪 Yes!', '🤷 Maybe', '😅 It\'s hard']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-opportunity-cost',
    level: 2,
    type: 'quiz',
    title: '🤷 Choosing This Over That',
    content: 'When you spend money on one thing, you can\'t spend it on something else. This is called "opportunity cost" - what you give up.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'You have $10. Buy a book OR see a movie. If you choose the book, what\'s your opportunity cost?',
      options: ['The book', 'The movie', 'The $10'],
      correctAnswer: 1,
      explanation: 'Right! You gave up the movie to get the book. Every choice has a trade-off.'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l2-opportunity-cost-alt1']
  },
  {
    id: 'l2-opportunity-cost-alt1',
    level: 2,
    type: 'scenario',
    title: '🎮 Game vs. Art Supplies',
    content: 'You saved $25. You want BOTH a video game AND art supplies, but each costs $25. You have to choose just one.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'How would you decide?',
      options: ['Which I\'d use more', 'Which I want right now', 'Ask someone for advice'],
      explanation: 'Smart! Thinking about which you\'ll use more helps you make better choices.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-sharing-giving',
    level: 2,
    type: 'reflection',
    title: '❤️ Sharing Your Money',
    content: 'Some people like to share their money by giving to others or donating to causes they care about. Even small amounts can make a difference!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Have you ever given or donated money?',
      emojiOptions: ['✅ Yes', '❌ No', '🤔 I want to']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-budget-intro',
    level: 2,
    type: 'tip',
    title: '📊 What\'s a Budget?',
    content: 'A budget is a plan for your money. It helps you decide how much to save, spend, and maybe give away. It\'s like a map for your money!',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Does having a plan for your money sound helpful?'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l2-budget-intro-alt1']
  },
  {
    id: 'l2-budget-intro-alt1',
    level: 2,
    type: 'challenge',
    title: '📊 Try a Simple Budget',
    content: 'Here\'s a simple rule: Save 50%, Spend 40%, Give 10%. If you get $10, that\'s $5 to save, $4 to spend, $1 to give.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Want to try this rule?',
      options: ['Yes, I\'ll try it!', 'Maybe different amounts', 'I need to think'],
      explanation: 'Great! You can adjust the amounts to what works for YOU.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-impulse-buying',
    level: 2,
    type: 'scenario',
    title: '🛒 The "Must Have It!" Feeling',
    content: 'You see something cool at the store and really want it RIGHT NOW. But wait! This feeling might pass. Try waiting 24 hours before buying.',
    interactionType: 'emoji',
    interactionData: {
      question: 'Has this happened to you?',
      emojiOptions: ['😅 Yes, a lot!', '🤔 Sometimes', '👍 I usually wait']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l2-track-spending',
    level: 2,
    type: 'tip',
    title: '📝 Know Where It Goes',
    content: 'You\'re already tracking your money in this app - great job! Knowing where your money goes helps you make better decisions.',
    interactionType: 'emoji',
    interactionData: {
      question: 'Are you learning anything from tracking?',
      emojiOptions: ['✅ Yes!', '🤷 A little', '🤔 Not sure yet']
    },
    requiresAcknowledgment: true
  },

  // ==================== LEVEL 3: GROWING KNOWLEDGE ====================
  // Experienced: $500-$1500, deeper concepts
  
  {
    id: 'l3-interest-intro',
    level: 3,
    type: 'tip',
    title: '📈 Money That Grows',
    content: 'When you save money in a bank, they pay you "interest" - extra money just for keeping it there! It\'s like your money is working for you.',
    interactionType: 'emoji',
    interactionData: {
      question: 'Did you know banks pay you to save?',
      emojiOptions: ['🤯 Whoa!', '👍 Yeah!', '🤔 Tell me more']
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l3-interest-intro-alt1']
  },
  {
    id: 'l3-interest-intro-alt1',
    level: 3,
    type: 'quiz',
    title: '📈 Interest Quiz',
    content: 'If you put $100 in a bank with 5% interest per year, how much would they give you after one year?',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Calculate the interest:',
      options: ['$5', '$50', '$100'],
      correctAnswer: 0,
      explanation: 'Correct! 5% of $100 is $5. So you\'d have $105 total - you earned $5 just for saving!'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-bank-vs-piggybank',
    level: 3,
    type: 'scenario',
    title: '🏦 Bank or Piggy Bank?',
    content: 'A piggy bank keeps money safe at home. A bank account is safer AND pays you interest. But you need an adult to help set it up.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Where do you keep most of your money?',
      options: ['Piggy bank at home', 'In a bank account', 'Different places', 'Not sure'],
      explanation: 'Each option has benefits! Talk to your family about what works best.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-big-purchase-planning',
    level: 3,
    type: 'challenge',
    title: '💰 Planning Big Purchases',
    content: 'When saving for something expensive, break it down: If you want a $200 bike and can save $10/week, you\'ll need 20 weeks (about 5 months).',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Does breaking it down make big goals feel easier?',
      options: ['Yes, much easier!', 'A little easier', 'Still seems hard'],
      explanation: 'Breaking big goals into small steps makes them feel achievable!'
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l3-big-purchase-planning-alt1']
  },
  {
    id: 'l3-big-purchase-planning-alt1',
    level: 3,
    type: 'tip',
    title: '🎯 The Milestone Method',
    content: 'For big savings goals, celebrate milestones! Saving for $200? Celebrate at $50, $100, $150. Each milestone keeps you motivated!',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Would celebrating milestones help you?'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-earning-ideas',
    level: 3,
    type: 'tip',
    title: '💼 Ways to Earn',
    content: 'Beyond allowance, you can earn by: doing extra chores, selling things you make, helping neighbors, or starting a small business (like lemonade stand)!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Which sounds most interesting?',
      emojiOptions: ['🏠 Chores', '🎨 Selling crafts', '🧑‍🤝‍🧑 Helping neighbors', '🍋 Small business']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-risk-reward',
    level: 3,
    type: 'scenario',
    title: '⚖️ Risk and Reward',
    content: 'Sometimes bigger rewards come with bigger risks. Like investing money might grow it faster, but you could also lose some. Safer choices grow slower but are more certain.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'What sounds more like you?',
      options: ['I prefer safe and steady', 'I like some risk for bigger rewards', 'I\'m not sure yet'],
      explanation: 'Knowing your comfort level with risk helps you make better money choices!'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-comparison-shopping',
    level: 3,
    type: 'tip',
    title: '🔍 Shop Smart',
    content: 'Before buying, compare prices at different stores or online. Sometimes you can find the same thing for less money elsewhere!',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Do you usually compare prices?'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-value-vs-price',
    level: 3,
    type: 'quiz',
    title: '💎 Price vs. Value',
    content: 'Price is how much something costs. Value is how much it\'s worth to YOU. A $5 book you read 10 times has more value than a $50 toy you use once.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Which has better value?',
      options: ['$20 shoes that last 6 months', '$40 shoes that last 2 years'],
      correctAnswer: 1,
      explanation: 'Smart! The $40 shoes cost more but last longer, so they\'re a better value.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l3-emergency-fund',
    level: 3,
    type: 'tip',
    title: '🆘 Emergency Money',
    content: 'An emergency fund is money saved for surprises - like if something breaks or you need to replace something important. Even $20-50 helps!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Do you have emergency money set aside?',
      emojiOptions: ['✅ Yes', '🤔 Working on it', '❌ Not yet']
    },
    requiresAcknowledgment: true
  },

  // ==================== LEVEL 4: ADVANCED CONCEPTS ====================
  // Expert: $1500+, sophisticated understanding
  
  {
    id: 'l4-compound-interest',
    level: 4,
    type: 'tip',
    title: '🚀 Money That Multiplies',
    content: 'Compound interest is when you earn interest on your interest! If you earn $5 interest, next year you earn interest on $105, not just $100. It grows faster!',
    interactionType: 'emoji',
    interactionData: {
      question: 'Does this sound like magic?',
      emojiOptions: ['🤯 Mind blown!', '📈 Makes sense!', '🤔 Still learning']
    },
    requiresAcknowledgment: true,
    alternateFormats: ['l4-compound-interest-alt1']
  },
  {
    id: 'l4-compound-interest-alt1',
    level: 4,
    type: 'funfact',
    title: '⏰ Time = Money Magic',
    content: 'Albert Einstein called compound interest "the 8th wonder of the world." Start saving young, and time does most of the work for you!',
    interactionType: 'thumbs',
    requiresAcknowledgment: true
  },
  {
    id: 'l4-inflation',
    level: 4,
    type: 'tip',
    title: '📉 Why Things Cost More',
    content: 'Inflation means prices go up over time. A candy that costs $1 today might cost $1.10 next year. This is why growing your money (interest/investing) matters.',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Have you noticed things getting more expensive?',
      options: ['Yes, definitely', 'A little bit', 'Not really'],
      explanation: 'Paying attention to prices is a great money skill!'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-investing-basics',
    level: 4,
    type: 'scenario',
    title: '📊 What is Investing?',
    content: 'Investing means using money to buy things that might grow in value - like stocks (parts of companies) or bonds (loans to companies). It\'s riskier than saving but can grow faster.',
    interactionType: 'emoji',
    interactionData: {
      question: 'Does investing interest you?',
      emojiOptions: ['🌟 Very much', '🤔 Maybe later', '📚 Need to learn more']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-diversification',
    level: 4,
    type: 'tip',
    title: '🧺 Don\'t Put All Eggs in One Basket',
    content: 'Diversification means spreading your money across different places. If one investment goes down, others might go up. It reduces risk!',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Does splitting your money across different places sound smart?'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-long-term-thinking',
    level: 4,
    type: 'reflection',
    title: '🔮 Think Long-Term',
    content: 'Money decisions you make now can affect your future. Saving even small amounts as a teen can grow into big amounts by the time you\'re an adult.',
    interactionType: 'emoji',
    interactionData: {
      question: 'Do you think about your future when making money choices?',
      emojiOptions: ['✅ Yes, often', '🤷 Sometimes', '🆕 Starting to']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-credit-basics',
    level: 4,
    type: 'tip',
    title: '💳 What is Credit?',
    content: 'Credit is borrowing money you promise to pay back later. Credit cards let you borrow, but you must pay it back (plus fees if you\'re late). Only borrow what you can repay!',
    interactionType: 'multiple-choice',
    interactionData: {
      question: 'Does borrowing money sound...',
      options: ['Helpful but risky', 'Confusing', 'Something to learn more about'],
      explanation: 'Smart! Credit can be useful but needs to be handled carefully.'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-career-money',
    level: 4,
    type: 'reflection',
    title: '💼 Future Earnings',
    content: 'Different careers earn different amounts. But money isn\'t everything - also think about what you enjoy and what makes you happy!',
    interactionType: 'emoji',
    interactionData: {
      question: 'What matters most to you in a future career?',
      emojiOptions: ['💰 Good pay', '❤️ Doing what I love', '⚖️ Balance of both']
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-taxes-intro',
    level: 4,
    type: 'tip',
    title: '🏛️ What Are Taxes?',
    content: 'Taxes are money people pay to the government. The government uses it for roads, schools, hospitals, and more. When you earn money, some goes to taxes.',
    interactionType: 'yes-no',
    interactionData: {
      question: 'Did you know about taxes?'
    },
    requiresAcknowledgment: true
  },
  {
    id: 'l4-financial-independence',
    level: 4,
    type: 'tip',
    title: '🦅 Financial Independence',
    content: 'Financial independence means having enough money saved that you don\'t worry about it. You\'re building those skills right now by tracking and saving!',
    interactionType: 'emoji',
    interactionData: {
      question: 'How do you feel about your money skills?',
      emojiOptions: ['💪 Growing stronger!', '📈 Getting better!', '🌱 Just starting']
    },
    requiresAcknowledgment: true
  },

  // ==================== CELEBRATION CARDS ====================
  // Milestone celebrations
  
  {
    id: 'celebrate-first-save',
    level: 1,
    type: 'celebration',
    title: '🎉 First Money Saved!',
    content: 'Amazing! You\'ve started tracking your money. This is the first step to becoming great with money!',
    interactionType: 'emoji',
    interactionData: {
      emojiOptions: ['🎉 Yay!', '💪 Let\'s go!']
    },
    requiresAcknowledgment: false
  },
  {
    id: 'celebrate-100',
    level: 2,
    type: 'celebration',
    title: '💯 $100 Milestone!',
    content: 'Wow! You\'ve saved over $100. That\'s a big achievement. Keep up the great work!',
    interactionType: 'emoji',
    interactionData: {
      emojiOptions: ['🏆 Thank you!', '🚀 Next goal!']
    },
    requiresAcknowledgment: false
  },
  {
    id: 'celebrate-500',
    level: 3,
    type: 'celebration',
    title: '🌟 $500 Achieved!',
    content: 'Incredible! You\'ve reached $500. Your money management skills are getting really strong!',
    interactionType: 'emoji',
    interactionData: {
      emojiOptions: ['💎 Amazing!', '📈 Growing!']
    },
    requiresAcknowledgment: false
  },
  {
    id: 'celebrate-1500',
    level: 4,
    type: 'celebration',
    title: '🏆 $1500+ Master!',
    content: 'Outstanding! You\'re managing serious money now. You\'re building skills that will help you for life!',
    interactionType: 'emoji',
    interactionData: {
      emojiOptions: ['👑 Proud!', '🎯 Keep going!']
    },
    requiresAcknowledgment: false
  }
];

/**
 * Determine user's current level based on their money and engagement
 */
export function calculateUserLevel(
  totalBalance: number,
  transactionCount: number,
  daysSinceFirstUse: number
): ProgressLevel {
  // Level 1: Foundation (0-$100)
  if (totalBalance < 100 && transactionCount < 10) return 1;
  
  // Level 2: Building Blocks ($100-$500)
  if (totalBalance < 500 || transactionCount < 25) return 2;
  
  // Level 3: Growing Knowledge ($500-$1500)
  if (totalBalance < 1500 || transactionCount < 50) return 3;
  
  // Level 4: Advanced Concepts ($1500+)
  return 4;
}

/**
 * Get cards appropriate for user's level
 */
export function getCardsForLevel(level: ProgressLevel): LearningCard[] {
  return LEARNING_CARDS.filter(card => card.level <= level);
}

/**
 * Get a card to show next, considering:
 * - User's current level
 * - Previously seen cards
 * - Dismissed cards (re-show in alternate format after 7 days)
 * - Time since last card shown (don't show too frequently)
 */
export function getNextCard(
  userProgress: UserProgress,
  totalBalance: number,
  transactionCount: number,
  daysSinceFirstUse: number
): LearningCard | null {
  const currentLevel = calculateUserLevel(totalBalance, transactionCount, daysSinceFirstUse);
  const availableCards = getCardsForLevel(currentLevel);
  
  // Don't show cards too frequently (at least 1 hour between cards)
  const hoursSinceLastCard = (Date.now() - userProgress.lastShownTimestamp) / (1000 * 60 * 60);
  if (hoursSinceLastCard < 1) return null;
  
  // Check for celebration milestones
  const celebrationCard = checkForCelebration(totalBalance, userProgress);
  if (celebrationCard) return celebrationCard;
  
  // Filter out already acknowledged cards
  const unseenCards = availableCards.filter(
    card => !userProgress.acknowledgedCardIds.includes(card.id) && card.type !== 'celebration'
  );
  
  // Check dismissed cards - re-show in alternate format after 7 days
  const dismissedToRetry = availableCards.filter(card => {
    if (!userProgress.dismissedCardIds.includes(card.id)) return false;
    
    const dismissedTime = userProgress.dismissedTimestamps[card.id];
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceDismissed >= 7 && card.alternateFormats) {
      // Find an alternate format that hasn't been shown
      const alternateCard = card.alternateFormats
        .map(id => LEARNING_CARDS.find(c => c.id === id))
        .find(alt => alt && !userProgress.seenCardIds.includes(alt.id));
      
      return !!alternateCard;
    }
    
    return false;
  });
  
  // If we have dismissed cards to retry with alternate formats, prioritize those
  if (dismissedToRetry.length > 0) {
    const originalCard = dismissedToRetry[Math.floor(Math.random() * dismissedToRetry.length)];
    const alternateId = originalCard.alternateFormats![0]; // Get first alternate
    const alternateCard = LEARNING_CARDS.find(c => c.id === alternateId);
    if (alternateCard && !userProgress.seenCardIds.includes(alternateCard.id)) {
      return alternateCard;
    }
  }
  
  // If no unseen cards, user has seen everything at their level
  if (unseenCards.length === 0) return null;
  
  // Return a random unseen card
  return unseenCards[Math.floor(Math.random() * unseenCards.length)];
}

/**
 * Check if user has hit a celebration milestone
 */
function checkForCelebration(totalBalance: number, userProgress: UserProgress): LearningCard | null {
  // Check each milestone once
  if (totalBalance >= 1500 && !userProgress.acknowledgedCardIds.includes('celebrate-1500')) {
    return LEARNING_CARDS.find(c => c.id === 'celebrate-1500') || null;
  }
  if (totalBalance >= 500 && !userProgress.acknowledgedCardIds.includes('celebrate-500')) {
    return LEARNING_CARDS.find(c => c.id === 'celebrate-500') || null;
  }
  if (totalBalance >= 100 && !userProgress.acknowledgedCardIds.includes('celebrate-100')) {
    return LEARNING_CARDS.find(c => c.id === 'celebrate-100') || null;
  }
  if (totalBalance > 0 && !userProgress.acknowledgedCardIds.includes('celebrate-first-save')) {
    return LEARNING_CARDS.find(c => c.id === 'celebrate-first-save') || null;
  }
  
  return null;
}

/**
 * Record that a card was shown to the user
 */
export function markCardAsShown(userProgress: UserProgress, cardId: string): UserProgress {
  return {
    ...userProgress,
    seenCardIds: [...new Set([...userProgress.seenCardIds, cardId])],
    lastShownTimestamp: Date.now()
  };
}

/**
 * Record that user acknowledged/interacted with a card
 */
export function markCardAsAcknowledged(
  userProgress: UserProgress, 
  cardId: string,
  interactionType: string,
  response?: any
): UserProgress {
  return {
    ...userProgress,
    acknowledgedCardIds: [...new Set([...userProgress.acknowledgedCardIds, cardId])],
    interactionHistory: [
      ...userProgress.interactionHistory,
      {
        cardId,
        timestamp: Date.now(),
        interactionType,
        response
      }
    ]
  };
}

/**
 * Record that user dismissed a card without interaction
 */
export function markCardAsDismissed(userProgress: UserProgress, cardId: string): UserProgress {
  return {
    ...userProgress,
    dismissedCardIds: [...new Set([...userProgress.dismissedCardIds, cardId])],
    dismissedTimestamps: {
      ...userProgress.dismissedTimestamps,
      [cardId]: Date.now()
    }
  };
}

/**
 * Initialize user progress for a new user
 */
export function initializeUserProgress(): UserProgress {
  return {
    currentLevel: 1,
    seenCardIds: [],
    acknowledgedCardIds: [],
    dismissedCardIds: [],
    dismissedTimestamps: {},
    lastShownTimestamp: 0,
    levelUnlockedDates: { 1: Date.now() },
    interactionHistory: []
  };
}
