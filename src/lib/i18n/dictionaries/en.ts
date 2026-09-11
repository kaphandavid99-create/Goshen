/**
 * English dictionary — the source of truth for the storefront's UI copy.
 *
 * `fr.ts` must mirror this shape exactly (it's typed as `Dictionary`, so the
 * compiler flags any missing or extra key). Dynamic strings are expressed as
 * small functions so both languages can order the pieces naturally.
 */

export const en = {
  common: {
    brandTagline: "New Bell · Bamenda",
    shopNow: "Shop now",
    addToCart: "Add to cart",
    added: "Added",
    outOfStock: "Out of stock",
    loading: "Loading…",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    cancel: "Cancel",
    remove: "Remove",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    continue: "Continue",
    close: "Close",
    menu: "Menu",
    search: "Search",
    yes: "Yes",
    no: "No",
    all: "All",
    from: "From",
    each: "each",
    perUnit: "/ unit",
    free: "Free",
    optional: "optional",
    required: "required",
    somethingWrong: "Something went wrong. Please try again.",
    viewAll: "View all",
    learnMore: "Learn more",
    getDirections: "Get directions",
    callShop: "Call the shop",
    whatsappShop: "WhatsApp the shop",
    points: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
    items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
  },

  language: {
    label: "Language",
    english: "English",
    french: "Français",
    switchTo: (name: string) => `Switch to ${name}`,
  },

  nav: {
    home: "Home",
    shop: "Shop",
    bundles: "Bundles",
    deals: "Deals",
    wholesale: "Wholesale",
    rewards: "Rewards",
    about: "About Us",
    contact: "Contact",
    dashboard: "Dashboard",
    primary: "Primary",
    appearance: "Appearance",
    support: "Support",
  },

  header: {
    freeDeliveryShort: "Free delivery from 15,000 FCFA",
    freeDeliveryLong: "Free delivery in Bamenda from 15,000 FCFA",
    account: "Account",
    signIn: "Sign in",
    signedIn: "Signed in",
    searchPlaceholder: "Search products…",
    cartLabel: "Cart",
    basket: "Basket",
  },

  search: {
    productsLabel: "Search products",
    dialogLabel: "Product search",
    close: "Close search",
    catalogue: "Search the Goshen catalogue",
    enter: "Enter",
    toSearch: "to search",
    esc: "Esc",
    toClose: "to close",
    submit: "Search",
  },

  footer: {
    openNow: "Open now",
    closedNow: "Closed now",
    eyebrow: "The neighborhood shop",
    headline: ["Shop", "close to", "home."],
    lead: "Groceries, household, and personal care —",
    leadEm: " ordered online, paid when it arrives.",
    visitTitle: "Visit the shop",
    location: "Location",
    hours: "Hours",
    call: "Call",
    contactSupport: "Contact and support",
    explore: "Explore",
    accountCol: "Account",
    rewardsCol: "Rewards",
    rewardsCopy:
      "Earn 1 point per 100 FCFA. Get 100 when a friend joins and makes their first purchase. Redeem from 100 points as a shop discount — not cash.",
    howRewardsWork: "How rewards work",
    rightsReserved: (year: number) => `© ${year} Goshen. All rights reserved.`,
    accountLinks: {
      signIn: "Sign in",
      createAccount: "Create account",
      dashboard: "Dashboard",
      cart: "Cart",
    },
  },

  cart: {
    kicker: "Basket",
    title: "Cart",
    intro: "Review items before checkout. Prices are in FCFA.",
    loading: "Loading basket…",
    empty: "Your basket is empty.",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total",
    checkout: "Checkout",
    remove: "Remove",
    flavorTotal: (n: number) => `${n} total`,
    removeOne: (flavor: string) => `Remove one ${flavor}`,
    addOne: (flavor: string) => `Add one ${flavor}`,
    quantityFor: (name: string) => `Quantity for ${name}`,
    decreaseQty: (name: string) => `Decrease quantity of ${name}`,
    increaseQty: (name: string) => `Increase quantity of ${name}`,
    deliveryAddMore: (amount: string) => ` · add ${amount} more for free delivery`,
    open: "Open cart",
  },

  home: {
    heroDefaults: {
      kicker: "New Bell, Bamenda",
      headline: "Everything you need,",
      rotatingLines: [
        "right around the corner.",
        "delivered across Bamenda.",
        "paid when it arrives.",
        "from the New Bell shop.",
      ],
      lead: "Groceries, household, and personal care — ordered online, paid when it arrives or when you collect it.",
      primaryCtaLabel: "Shop now",
      secondaryCtaLabel: "Today's deals",
      imageAlt:
        "A grocery basket filled with fresh produce and household staples",
    },
    trust: {
      quality: "Quality products",
      prices: "Fair FCFA prices",
      delivery: "Bamenda delivery",
      payOnArrival: "Pay on arrival",
    },
    ribbon: {
      openDaily: "Open daily",
      callWhatsapp: "Call / WhatsApp",
      ourLocation: "Our location",
      rewards: "Goshen Rewards",
      rewardsDetail: "Earn points on every shop",
    },
    shopByCategory: "Shop by category",
    todaysDeals: "Today's deals",
    limitedTime: "Limited time",
    viewAllDeals: "View all deals",
    bundles: {
      title: "Value bundles",
      seeAll: "See all bundles",
    },
    promoStayHome: "Stay home. We will bring the shop to you.",
    promoStayHomeBody:
      "Order groceries and household staples for delivery across Bamenda.",
    orderForDelivery: "Order for delivery",
    referFriend: "Refer a friend",
    referFriendBody:
      "Earn 100 points when a friend signs up and places their first order.",
    getReferralLink: "Get your referral link",
    perks: {
      earnTitle: "Earn points",
      earnBody: "1 point per 100 FCFA you pay. Sign up for 50.",
      redeemTitle: "Redeem and save",
      redeemBody:
        "From 100 points, take 1 FCFA off per point on orders from 1,000 FCFA. Not cash.",
      extrasTitle: "Member extras",
      extrasBody: "Featured deals and free delivery from 15,000 FCFA.",
    },
    testimonials: {
      kicker: "From customers",
      title: "What Bamenda families say",
      averageSuffix: "from recent shoppers",
      starsOutOf5: (n: number) => `${n} out of 5 stars`,
      verifiedOn: (date: string) => `Verified customer · ${date}`,
    },
  },

  bundles: {
    kicker: "Save time",
    title: "Bundles",
    intro:
      "Ready-made sets at one price — add a whole shop in a single tap.",
    empty: "No bundles right now.",
    whatsInside: "What's inside",
    someOut: "One of the products in this bundle is out of stock right now.",
    contains: "Contains:",
  },

  shop: {
    kickerCatalog: "Catalog",
    kickerFeatured: "Featured",
    titleShop: "Shop",
    titleDeals: "Today's deals",
    introShop: "Groceries and household staples, priced in FCFA.",
    introDeals: "Limited-time featured items, priced in FCFA.",
    categoriesLabel: "Categories",
    all: "All",
    nipzBannerDesc:
      "Custom cakes & pastries — browse the gallery and book online",
    resultsFor: "Results for",
    noProducts: "No products in this selection yet.",
    choose: "Choose",
    chooseFlavours: "Choose flavours",
    chooseFlavoursHint: "Set how many of each flavour you want.",
    add: "Add",
    addN: (n: number) => `Add ${n} to cart`,
    removeFromWishlist: "Remove from wishlist",
    addToWishlist: "Add to wishlist",
    saveToWishlist: "Save to wishlist",
    savedToWishlist: "Saved to wishlist",
    backToShop: "Back to shop",
    wholesaleLabel: "Wholesale",
    forApprovedBuyers: "for approved business buyers",
    reviews: {
      title: "Reviews",
      none: "No reviews yet. Customers can rate this item after they receive an order.",
      summary: (avg: string, count: number) =>
        `${avg} · ${count} ${count === 1 ? "review" : "reviews"}`,
    },
    productFallbackTitle: "Product",
  },

  checkout: {
    kicker: "Order",
    title: "Checkout",
    intro:
      "Choose delivery or pickup. Payment is collected when the order arrives or when you collect it. Points can only be used as a shop discount.",
    loading: "Loading checkout…",
    emptyCart: "Your cart is empty.",
    continueShopping: "Continue shopping",
    fulfillment: "Fulfillment",
    deliveryInBamenda: "Delivery in Bamenda",
    pickupAtNewBell: "Pickup at New Bell",
    fullName: "Full name",
    phone: "Phone / WhatsApp",
    savedAddress: "Saved address",
    default: "Default",
    saveAddressesPre: "Save addresses in your",
    saveAddressesLink: "account",
    saveAddressesPost: "to fill this faster next time.",
    deliveryAddress: "Delivery address",
    notes: "Notes (optional)",
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    delivery: "Delivery",
    pointsDiscount: "Points discount",
    total: "Total",
    usePoints: (n: number) =>
      `Use ${n} points as a shop discount. Points are not paid out as cash.`,
    pointsBelowMin: (n: number) =>
      `You have ${n} points. Redeeming starts at 100 points.`,
    pointsNeedSubtotal: "Add items to reach 1,000 FCFA before you can redeem points.",
    earnsNote: (earned: number, freeFrom: string, fee: string) =>
      `This order earns ${earned} ${earned === 1 ? "point" : "points"} (1 point per 100 FCFA paid). Pay on delivery or at pickup. Free delivery from ${freeFrom}. Standard delivery is ${fee}.`,
    unableToPlace: "Unable to place the order.",
    networkError: "Network error. Try again.",
    placingOrder: "Placing order…",
    placeOrder: "Place order",
    payment: "Payment",
    payCash: "Pay on delivery or pickup (cash)",
    payMomo: "Pay now with MTN MoMo",
    momoNumber: "MTN MoMo number",
    momoHint:
      "You'll get a prompt on this number to approve the payment with your PIN.",
    pointsCashOnly: "Points can only be used on cash orders.",
    payAmountMomo: (amount: string) => `Pay ${amount} with MoMo`,
  },

  pay: {
    kicker: "Payment",
    amount: "Amount",
    checkPhone: "Check your phone",
    checkPhoneHint:
      "Approve the MTN MoMo payment request with your PIN. This page updates on its own.",
    stillPending: "Still waiting for approval",
    stillPendingHint:
      "It's taking longer than usual. Approve it on your phone, or check the order later — we'll notify you once it clears.",
    keepWaiting: "Keep waiting",
    goToOrder: "Go to the order",
    paid: "Payment received — taking you to your order.",
    failed: "Payment didn't go through",
    tryAgain: "Try again",
    cancelOrder: "Cancel this order",
    error: "Something went wrong. Try again.",
    finishPayment: "Finish payment →",
  },

  about: {
    kicker: "About Goshen",
    title: "Groceries from New Bell, Bamenda",
    intro:
      "Goshen is a neighborhood grocery and household store. We stock everyday food, cleaning supplies, and personal care so families in Bamenda can shop close to home — or have an order delivered.",
    whereTitle: "Where we are",
    howTitle: "How we sell",
    howBody:
      "Prices are in FCFA. Pay on delivery or when you pick up at the shop. Delivery is free from 15,000 FCFA.",
    browseShop: "Browse the shop",
    contactUs: "Contact us",
  },

  contact: {
    kicker: "Contact",
    title: "Talk to the shop",
    intro:
      "Questions about stock, delivery in Bamenda, or an order? Reach us during store hours.",
    visitTitle: "Visit",
    seeOnMap: "See it on the map",
    callWhatsappTitle: "Call or WhatsApp",
    chatOnWhatsapp: "Chat on WhatsApp",
    sendMessage: "Send a message",
    sendMessageHint: "This opens WhatsApp with your note ready to send.",
    yourName: "Your name",
    message: "Message",
    sendOnWhatsapp: "Send on WhatsApp",
    sentNote:
      "WhatsApp should open with your message. If it does not, call us instead.",
    waGreetingNamed: (name: string, message: string) =>
      `Hello Goshen, I'm ${name}. ${message}`,
    waGreeting: (message: string) => `Hello Goshen. ${message}`,
  },

  storeMap: {
    kicker: "Find us",
    title: "Where the shop is",
    getDirections: "Get directions",
    mapTitle: (name: string, location: string) =>
      `Map showing ${name} in ${location}`,
    tapPre: "Tap the map or",
    tapLink: "open it in Google Maps",
    tapPost: "for turn-by-turn navigation.",
  },

  auth: {
    kicker: "Account",
    signInTitle: "Sign in",
    signInIntro: "Continue with Google, or sign in with your Goshen email.",
    registerTitle: "Create account",
    registerIntro:
      "Continue with Google, or create an account with email. Sessions use HTTP-only cookies.",
    continueWithGoogle: "Continue with Google",
    orCreateEmail: "or create with email",
    orSignInEmail: "or sign in with email",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    referralNote: "Signing up with referral code",
    somethingWrong: "Something went wrong.",
    networkError: "Network error. Try again.",
    csrfError: "Unable to prepare a secure form. Refresh and try again.",
    googleSetup:
      "Google sign-in is not connected yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env, then restart the app.",
    googleFailed:
      "Google sign-in did not complete. Use http://localhost:3005 (not 127.0.0.1), then try Continue with Google again.",
    pleaseWait: "Please wait…",
    createAccount: "Create account",
    signIn: "Sign in",
    haveAccount: "Already have an account?",
    newToGoshen: "New to Goshen?",
    createAnAccount: "Create an account",
  },

  rewards: {
    kicker: "Rewards",
    title: "Points on every shop",
    intro:
      "Earn points when you join, shop, refer a friend, or review a product. Redeem them only as a discount at checkout — never as cash.",
    yourInvite: "Your invite",
    signInForLink: "Sign in to get a personal referral link.",
    openDashboard: "Open dashboard",
    createAccount: "Create account",
    startShopping: "Start shopping",
    perks: {
      earnTitle: "Earn on every shop",
      earnBody:
        "Collect 1 point for every 100 FCFA you pay. A 1,000 FCFA order earns 10 points.",
      referTitle: "Sign up and refer",
      referBody: (welcome: number, referral: number) =>
        `New accounts get ${welcome} points. You receive ${referral} points when a friend signs up with your link and places their first order. They still get ${welcome} points for joining.`,
      reviewTitle: "Review products",
      reviewBody: (review: number) =>
        `After you receive an order, each product review adds ${review} points.`,
      redeemTitle: "Redeem in the shop",
      redeemBody: (minPoints: number, minSubtotal: string) =>
        `From ${minPoints} points, use them as a discount on your next order of ${minSubtotal} or more. 1 point = 1 FCFA off. Points are not paid as cash.`,
    },
  },

  account: {
    kicker: "Dashboard",
    welcome: (name: string) => `Welcome, ${name}`,
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    intro:
      "Profile, orders, wishlist, rewards, notifications, and saved addresses.",
    navLabel: "Account",
    nav: {
      profile: "Profile",
      orders: "Orders",
      wishlist: "Wishlist",
      rewards: "Rewards",
      notifications: "Notifications",
      addresses: "Addresses",
    },
    signOut: "Sign out",
    signingOut: "Signing out…",
    signOutError: "Unable to sign out. Try again.",

    profile: {
      title: "Profile",
      memberSince: (date: string) => `Member since ${date}.`,
      fullName: "Full name",
      email: "Email",
      phone: "Phone / WhatsApp",
      save: "Save profile",
      saving: "Saving…",
      saved: "Profile saved.",
      unableToSave: "Unable to save profile.",
      networkError: "Network error. Try again.",
      uploadPhoto: "Upload photo",
      changePhoto: "Change photo",
      removePhoto: "Remove",
      removing: "Removing…",
      uploading: "Uploading…",
      uploadFailed: "Upload failed.",
      photoRemoveError: "Could not remove the photo.",
      viewPhoto: "View photo",
      avatarHint: "JPG, PNG, or WEBP up to 5 MB. Helps the shop recognise you.",
    },

    stats: {
      orders: "Orders",
      points: "Points",
      spent: "Spent",
      pending: "Pending",
      continueShopping: "Continue shopping",
    },

    wholesaleCard: {
      label: "Wholesale",
      approvedTitle: "Wholesale account active",
      approvedCta: "Open wholesale catalog",
      pendingTitle: "Wholesale application under review",
      pendingCta: "View status",
      rejectedTitle: "Wholesale application not approved",
      rejectedCta: "Re-apply",
      noneTitle: "Buy in bulk at wholesale prices",
      noneCta: "Apply for wholesale",
    },

    orders: {
      title: "My orders",
      empty: "You have not placed an order yet.",
      startShopping: "Start shopping",
      delivery: "Delivery",
      pickup: "Pickup",
      itemsCount: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
      acceptedConfirm: "Accepted · confirm when it arrives",
    },

    wishlist: {
      title: "Wishlist",
      empty: "Save products while you shop.",
      browse: "Browse the shop",
    },

    rewards: {
      title: "Rewards",
      pointsAmount: (n: number) => `${n} points`,
      redeemHint: (minPoints: number, minSubtotal: string) =>
        `Redeem from ${minPoints} points on orders of ${minSubtotal} or more. 1 point = 1 FCFA off. Not cash.`,
      redeemAtCheckout: "Redeem at checkout",
      referTitle: "Refer a friend",
      friendsSignedUp: "Friends signed up",
      firstOrderRewards: "First-order rewards",
      friendFirstOrder: (n: number) => `First order · ${n} points awarded`,
      friendWaiting: "Signed up · waiting for first order",
      noReferralYet:
        "Your referral link will appear once the database is connected.",
      summary: (welcome: number, referral: number, review: number) =>
        `Sign up: ${welcome} points. Referrer: ${referral} points after a friend's first order. Reviews: ${review} points. More on`,
      rewardsLink: "Rewards",
    },

    notifications: {
      title: "Notifications",
      empty: "Order updates and reward alerts will appear here.",
    },

    push: {
      title: "Phone alerts",
      blurb:
        "Get a pop-up on this phone for every order update, booking and reward — even when Goshen is closed in your browser.",
      loading: "Checking this device…",
      unsupported:
        "This browser can't show phone alerts. Install Goshen to your home screen and open it from there.",
      blocked:
        "Notifications are blocked for Goshen in your browser settings. Allow them there, then reload this page.",
      enable: "Turn on alerts",
      working: "Working…",
      on: "Alerts are on for this device.",
      disable: "Turn off",
      test: "Send a test alert",
      testSent: "Sent. It should appear on this device in a moment.",
      error: "Something went wrong. Try again.",
    },

    addresses: {
      title: "Saved addresses",
      intro: "Keep delivery details here and reuse them at checkout.",
      emptyHint: "Save a delivery address to fill checkout faster.",
      default: "Default",
      edit: "Edit",
      delete: "Delete",
      add: "Add address",
      unableToSave: "Unable to save address.",
      unableToDelete: "Unable to delete address.",
      networkError: "Network error. Try again.",
      defaultLabel: "Home",
      fieldLabel: "Label",
      fullName: "Full name",
      phone: "Phone",
      line: "Address",
      useAsDefault: "Use as default delivery address",
      saving: "Saving…",
      save: "Save address",
      cancel: "Cancel",
    },
  },

  referral: {
    blurb:
      "Share this link. You get 100 points when your friend creates an account and places their first order. They get 50 points for joining.",
    yourCode: "Your code:",
    linkLabel: "Referral link",
    copy: "Copy link",
    copied: "Copied",
    shareOnWhatsapp: "Share on WhatsApp",
    networkError: "Network error. Try again.",
    shareText: (url: string) =>
      `Join Goshen with my link and we both earn points: ${url}`,
  },

  orders: {
    kicker: "Order placed",
    wholesalePrefix: "Wholesale · ",
    delivery: "Delivery",
    pickup: "Pickup",
    wholesaleNote:
      "The shop will confirm final pricing, payment terms, and delivery with you.",
    payNote: "Pay when the order arrives or when you collect it.",
    items: "Items",
    subtotal: "Subtotal",
    deliveryFee: "Delivery",
    arrangedAfter: "Arranged after confirmation",
    pointsDiscount: (n: number) => `Points discount (${n} pts)`,
    total: "Total",
    name: "Name:",
    phone: "Phone:",
    address: "Address:",
    notes: "Notes:",
    backToOrders: "Back to orders",
    progress: {
      placed: "Placed",
      accepted: "Accepted",
      received: "Received",
      cancelled: "This order was cancelled.",
      statusSr: (label: string) => `Status: ${label}`,
    },
    confirm: {
      title: "Have you received it?",
      body: "The shop has accepted your order. When the items arrive or you collect them, confirm here so we know the delivery is complete.",
      saving: "Saving…",
      button: "I have received my order",
      error: "Unable to confirm receipt.",
      networkError: "Network error. Try again.",
    },
    feedback: {
      title: "Share your experience",
      intro:
        "A short testimonial helps other shoppers, and item reviews tell us what to stock more of. Each product review adds 5 points.",
      testimonial: "Testimonial",
      howWas: "How was Goshen?",
      testimonialPlaceholder:
        "Tell us about the order, delivery, or shop visit.",
      itemReviews: "Item reviews",
      itemNotePlaceholder: "Optional note about this item",
      saving: "Saving…",
      update: "Update feedback",
      send: "Send feedback",
      thanks: "Thank you. Your feedback is saved.",
      error: "Unable to save feedback.",
      networkError: "Network error. Try again.",
    },
  },

  wholesale: {
    kicker: "Wholesale",
    metaDescription:
      "Buy Goshen groceries and household staples in bulk at wholesale prices.",
    // Landing (approved)
    catalogTitle: "Wholesale catalog",
    catalogIntro: (min: string) =>
      `Wholesale prices for approved business buyers. Minimum order ${min}. Delivery is arranged with you after the shop confirms your order.`,
    viewCart: "View wholesale cart",
    catalogEmpty: "No products are available for wholesale yet. Check back soon.",
    retail: "Retail",
    wholesalePrice: "Wholesale price",
    wholesaleLabel: "Wholesale",
    // Landing (not approved)
    applyTitle: "Buy in bulk at wholesale prices",
    applyIntro:
      "Goshen sells to shops, restaurants, schools, and resellers at wholesale prices. Apply for a wholesale account and, once approved, you'll unlock the wholesale catalog.",
    signInPrompt: "Sign in or create an account, then apply for wholesale access.",
    signIn: "Sign in",
    createAccount: "Create account",
    pendingTitle: "Your application is under review",
    pendingBody: (biz: string, phone: string) =>
      `We received your request${biz ? ` for ${biz}` : ""}. The shop will contact you on ${phone} once it's approved.`,
    yourPhone: "your phone",
    updateApplication: "Update my application",
    rejectedTitle: "Your last application was not approved",
    rejectedBody:
      "Contact the shop if you think this is a mistake, or submit a new application with more detail.",
    submitNewApplication: "Submit a new application",
    signedInPrompt:
      "You're signed in. Apply for a wholesale account to get started.",
    applyForWholesale: "Apply for wholesale",
    // Apply page
    applyPageTitle: "Apply for a wholesale account",
    applyPageIntroPre:
      "Tell us about your business. Once approved you'll see wholesale pricing and can order in bulk from the",
    applyPageIntroLink: "wholesale catalog",
    alreadyPending:
      "You already have an application under review. Submitting again replaces it.",
    // Application form
    businessName: "Business name",
    businessType: "Type of business",
    phone: "Phone / WhatsApp",
    locationLabel: "Where is the business based?",
    locationPlaceholder: "e.g. Nkwen, Bamenda",
    noteLabel: "Anything else? (optional)",
    notePlaceholder: "What you plan to buy, expected volumes, etc.",
    submitting: "Submitting…",
    unableToSubmit: "Unable to submit the application.",
    networkError: "Network error. Try again.",
    businessTypes: {
      "Retailer / shop": "Retailer / shop",
      "Restaurant / bar": "Restaurant / bar",
      "School / institution": "School / institution",
      "Reseller / distributor": "Reseller / distributor",
      Other: "Other",
    } as Record<string, string>,
    // Product detail
    retailPriceLine: (price: string, unit: string) =>
      `Retail price ${price} / ${unit}`,
    backToCatalog: "Back to wholesale catalog",
    // Add to cart
    add: "Add",
    quantityFor: (name: string) => `Quantity for ${name}`,
    lineTotal: (unit: string, perUnit: string, total: string) =>
      `${unit} / ${perUnit} · line total ${total}`,
    added: "Added.",
    viewCartShort: "View cart",
    // Cart
    cartTitle: "Your wholesale cart",
    loadingCart: "Loading cart…",
    cartEmpty: "Your wholesale cart is empty.",
    browseCatalog: "Browse the wholesale catalog",
    remove: "Remove",
    subtotal: "Subtotal",
    deliveryArranged: "Delivery is arranged after the shop confirms your order.",
    minOrderNote: (min: string) => `Wholesale orders start at ${min}.`,
    checkout: "Checkout",
    // Checkout
    checkoutTitle: "Wholesale checkout",
    checkoutIntro:
      "Place the order and the shop will confirm final pricing, payment terms, and delivery with you directly. No loyalty points apply to wholesale orders.",
    loadingCheckout: "Loading checkout…",
    browseTheCatalog: "Browse the catalog",
    fulfillment: "Fulfillment",
    deliveryOption: "Delivery (arranged with you after confirmation)",
    pickupOption: "Pickup at New Bell",
    contactName: "Contact name",
    deliveryAddress: "Delivery address",
    notes: "Notes (optional)",
    orderSummary: "Order summary",
    termsConfirmed:
      "Delivery and payment terms are confirmed by the shop after you place the order.",
    unableToPlace: "Unable to place the order.",
    placingOrder: "Placing order…",
    placeWholesaleOrder: "Place wholesale order",
  },

  pwa: {
    install: {
      title: "Add Goshen to your phone",
      blurb:
        "Install the shop like an app — a home-screen icon, full-screen browsing and faster loads. No app store needed.",
      action: "Install app",
      iosHint:
        "Tap the Share button in Safari, then choose “Add to Home Screen” to install Goshen.",
      dismiss: "Dismiss",
    },
  },

  nipz: {
    metaDescription:
      "Custom cakes, cupcakes, pastries and dessert tables made to order at Goshen in New Bell, Bamenda. Book online.",
    backToShop: "← Back to Shop",
    eyebrow: "Inside Goshen · New Bell, Bamenda",
    title: "Nipz Pretty Cakes",
    titleEm: "& Pastries",
    lead: "Custom cakes, pastries & dessert tables — baked fresh in New Bell, Bamenda. Every order is made to order — pick a style from the gallery or bring your own idea.",
    bookACake: "Book a cake",
    browseGallery: "Browse the gallery",
    whatsappBakery: "WhatsApp the bakery",
    stats: {
      madeToOrder: "Made to order",
      madeToOrderLabel: "No two cakes alike",
      daysNotice: (n: number) => `${n}+ days`,
      daysNoticeLabel: "Notice for custom work",
      pickupOrDelivery: "Pickup or delivery",
      pickupOrDeliveryLabel: "Across Bamenda",
    },
    galleryKicker: "The menu",
    galleryTitle: "Cakes & pastries",
    galleryIntro:
      "What comes out of the Goshen kitchen. Prices are a starting point and change with size, tiers and detail — tap Order on WhatsApp to confirm.",
    galleryEmpty:
      "Fresh photos are on the way. Message the bakery for the current menu.",
    all: "All",
    signature: "Signature",
    priceOnRequest: "Price on request",
    bookThis: "Book this",
    orderOnWhatsapp: "Order on WhatsApp",
    orderMessage: (business: string, item: string) =>
      `Hello ${business}, I'd like to order: ${item}. Please share availability and the final price.`,
    stepsKicker: "How booking works",
    stepsTitle: "Four simple steps",
    steps: [
      {
        title: "Share your idea",
        body: "Send flavours, colours, servings and your date through the form or on WhatsApp.",
      },
      {
        title: "Get a quote",
        body: "The bakery confirms availability and a final price, usually within a day.",
      },
      {
        title: "Approve & reserve",
        body: "Lock the date with a deposit. The balance is due on pickup or delivery.",
      },
      {
        title: "Fresh handover",
        body: "Your order is baked fresh and ready for pickup in New Bell, or delivered in Bamenda.",
      },
    ],
    bookEyebrow: "Book your order",
    bookTitle: "Tell us what you're dreaming of",
    bookChecks: [
      "Send inspiration photos on WhatsApp after you submit.",
      "A deposit reserves your date; balance on handover.",
      "Rush orders are sometimes possible — just ask.",
    ],
    form: {
      yourName: "Your name",
      phone: "Phone / WhatsApp",
      email: "Email (optional)",
      occasion: "Occasion",
      choose: "Choose…",
      cakeType: "Cake / pastry type",
      cakeTypePlaceholder: "e.g. 2-tier chocolate, macarons",
      servings: "Servings / size",
      servingsPlaceholder: "e.g. 25 people",
      neededBy: "Needed by",
      neededByHint: (n: number) => `Please allow at least ${n} days.`,
      budget: "Budget in FCFA (optional)",
      budgetPlaceholder: "e.g. 20000",
      collection: "Collection",
      pickupAtShop: "Pickup at the shop",
      deliveryInBamenda: "Delivery in Bamenda",
      tellUs: "Tell us about the cake",
      tellUsPlaceholder:
        "Colours, theme, flavours, message on the cake, any inspiration photos you'll send on WhatsApp…",
      sending: "Sending…",
      requestBooking: "Request this booking",
      sendOnWhatsappInstead: "Send on WhatsApp instead",
      noPaymentNow:
        "No payment now. The bakery confirms availability and a final price first.",
      couldNotSend: "Could not send the booking.",
      networkError: "Network error. Try again, or send the request on WhatsApp.",
      received:
        "Booking received. We're opening WhatsApp so you can send it straight to the bakery.",
      referenceLabel: (ref: string) => `Reference ${ref}`,
      whatsappDidntOpen:
        "If WhatsApp didn't open automatically, tap the button below to send your booking to the bakery.",
      sendOnWhatsapp: "Send on WhatsApp",
      newBooking: "New booking",
      wa: {
        intro: (bakery: string) =>
          `Hello ${bakery}, I'd like to book a cake / pastry order.`,
        reference: (ref: string) => `Reference: ${ref}`,
        name: (v: string) => `Name: ${v}`,
        phone: (v: string) => `Phone: ${v}`,
        occasion: (v: string) => `Occasion: ${v}`,
        flavor: (v: string) => `Flavour / type: ${v}`,
        servings: (v: string) => `Servings: ${v}`,
        neededBy: (v: string) => `Needed by: ${v}`,
        collection: (v: string) => `Collection: ${v}`,
        budget: (v: string) => `Budget: ${v} FCFA`,
        details: (v: string) => `Details: ${v}`,
        orderItem: (name: string) => `I'd like to order: ${name}.`,
        delivery: "Delivery",
        pickup: "Pickup",
      },
    },
    occasions: {
      Birthday: "Birthday",
      Wedding: "Wedding",
      Anniversary: "Anniversary",
      "Baby shower": "Baby shower",
      Graduation: "Graduation",
      "Corporate / event": "Corporate / event",
      "Just because": "Just because",
    } as Record<string, string>,
  },

  theme: {
    toggle: "Toggle theme",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },

  rating: {
    label: "Rating",
    outOf: (n: number, max: number) => `${n} out of ${max} stars`,
    nStars: (n: number) => `${n} ${n === 1 ? "star" : "stars"}`,
  },

  assistant: {
    open: "Open shop assistant",
    close: "Close shop assistant",
    closeShort: "Close",
    title: "Goshen assistant",
    subtitle: "Products, orders & points",
    greeting:
      "Hi! I can help you find products, check an order, or use your loyalty points. Ask me anything about Goshen.",
    inputPlaceholder: "Ask about a product, order or points…",
    send: "Send",
    micLabel: "Record a voice message",
    micStop: "Stop recording",
    micRecording: "Listening… tap to stop",
    micTranscribing: "Transcribing your recording…",
    micPermissionDenied:
      "Microphone access was denied. Allow it in your browser settings to use voice.",
    micError: "Couldn't use the microphone. Please try again.",
    suggestions: [
      "Do you have rice and cooking oil?",
      "What can I buy with my points?",
      "Track my latest order",
      "How does delivery work?",
    ],
    toolLabels: {
      search_products: "Searching the shop…",
      get_product_details: "Checking that product…",
      list_categories: "Loading categories…",
      get_my_orders: "Looking up your orders…",
      get_order_details: "Checking your order…",
      get_loyalty_status: "Checking your points…",
      get_help_topic: "Finding that info…",
      working: "Working on it…",
    } as Record<string, string>,
    unavailable: "The assistant is unavailable right now.",
    somethingWrong: "Something went wrong.",
    noAnswer: "No answer came through. Please try again.",
    networkProblem: "Network problem. Check your connection and try again.",
  },

  orderStatus: {
    AWAITING_PAYMENT: "Awaiting payment",
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    RECEIVED: "Received",
    CANCELLED: "Cancelled",
  },

  meta: {
    cart: "Cart",
    shop: "Shop",
    checkout: "Checkout",
    rewards: "Rewards",
    about: "About Us",
    contact: "Contact",
    wholesale: "Wholesale",
    login: "Sign in",
    register: "Create account",
    account: "Dashboard",
  },
};

export type Dictionary = typeof en;
