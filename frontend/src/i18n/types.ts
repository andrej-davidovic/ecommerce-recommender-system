export interface Translations {
  appName: string;
  tagline: string;

  nav: {
    home: string;
    products: string;
    wishlist: string;
    cart: string;
    orders: string;
    profile: string;
    admin: string;
    login: string;
    register: string;
    logout: string;
    searchPlaceholder: string;
  };

  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    heroCtaSecondary: string;
    recommendedForYou: string;
    recommendedSubtitle: string;
    popular: string;
    popularSubtitle: string;
    newArrivals: string;
    newArrivalsSubtitle: string;
    categories: string;
    categoriesSubtitle: string;
  };

  product: {
    addToCart: string;
    addedToCart: string;
    outOfStock: string;
    inStock: string;
    onlyLeft: (n: number) => string;
    description: string;
    reviews: string;
    similarProducts: string;
    noReviews: string;
    reviewCount: (n: number) => string;
    addToWishlist: string;
    removeFromWishlist: string;
    category: string;
    price: string;
  };

  products: {
    title: string;
    filters: string;
    category: string;
    allCategories: string;
    tag: string;
    allTags: string;
    sortBy: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    resultsCount: (n: number) => string;
    empty: string;
    clearFilters: string;
  };

  cart: {
    title: string;
    empty: string;
    emptyCta: string;
    total: string;
    quantity: string;
    remove: string;
    checkout: string;
    clear: string;
    itemAdded: string;
  };

  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    fullName: string;
    loginButton: string;
    registerButton: string;
    noAccount: string;
    haveAccount: string;
    registerLink: string;
    loginLink: string;
    selectInterests: string;
    selectInterestsHint: string;
    pendingApproval: string;
    invalidCredentials: string;
  };

  onboarding: {
    title: string;
    subtitle: string;
    save: string;
    skip: string;
  };

  source: Record<"collaborative" | "cold_start" | "popular", string>;

  checkout: {
    title: string;
    subtitle: string;
    orderSummary: string;
    payNow: string;
    processing: string;
    success: string;
    successMessage: string;
    viewOrders: string;
    continueShopping: string;
    paymentError: string;
    cartEmpty: string;
    cardDetails: string;
  };

  orders: {
    title: string;
    empty: string;
    emptyCta: string;
    orderNumber: string;
    date: string;
    status: string;
    total: string;
    items: string;
    quantity: string;
    unitPrice: string;
    viewDetails: string;
    statusLabels: Record<string, string>;
  };

  wishlist: {
    title: string;
    empty: string;
    emptyCta: string;
    itemCount: (n: number) => string;
  };

  profile: {
    title: string;
    subtitle: string;
    personalInfo: string;
    interests: string;
    interestsHint: string;
    saved: string;
    interestsSaved: string;
  };

  reviews: {
    writeReview: string;
    editReview: string;
    yourRating: string;
    comment: string;
    submit: string;
    update: string;
    delete: string;
    deleteConfirm: string;
    submitted: string;
    updated: string;
    deleted: string;
    alreadyReviewed: string;
  };

  admin: {
    dashboard: string;
    overview: string;
    users: string;
    products: string;
    metrics: string;
    totalUsers: string;
    totalProducts: string;
    totalOrders: string;
    pendingApprovals: string;
    approve: string;
    deactivate: string;
    activate: string;
    approved: string;
    deactivated: string;
    activated: string;
    addProduct: string;
    editProduct: string;
    productName: string;
    productDescription: string;
    productPrice: string;
    productImage: string;
    productCategory: string;
    productStock: string;
    productTags: string;
    productSaved: string;
    productDeleted: string;
    deleteProduct: string;
    deleteProductConfirm: string;
    retrain: string;
    retraining: string;
    retrained: string;
    algorithmStatus: string;
    algorithm: string;
    trainedAt: string;
    totalRecommendations: string;
    clickThroughRate: string;
    notTrained: string;
    active: string;
    inactive: string;
    role: string;
    status: string;
    createdAt: string;
  };

  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    welcome: string;
    relatedProducts: string;
  };

  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    back: string;
    currency: string;
  };

  footer: {
    rights: string;
    madeFor: string;
  };
}
