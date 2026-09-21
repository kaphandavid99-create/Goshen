import type { Dictionary } from "./en";

/**
 * French dictionary. Typed as `Dictionary`, so the compiler enforces that it
 * stays in lockstep with `en.ts`.
 */
export const fr: Dictionary = {
  common: {
    brandTagline: "New Bell · Bamenda",
    shopNow: "Acheter",
    addToCart: "Ajouter au panier",
    added: "Ajouté",
    outOfStock: "Rupture de stock",
    loading: "Chargement…",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Enregistré",
    cancel: "Annuler",
    remove: "Retirer",
    edit: "Modifier",
    delete: "Supprimer",
    back: "Retour",
    continue: "Continuer",
    close: "Fermer",
    menu: "Menu",
    search: "Rechercher",
    yes: "Oui",
    no: "Non",
    all: "Tous",
    from: "À partir de",
    each: "l'unité",
    perUnit: "/ unité",
    free: "Gratuit",
    optional: "facultatif",
    required: "requis",
    somethingWrong: "Une erreur est survenue. Veuillez réessayer.",
    viewAll: "Tout voir",
    learnMore: "En savoir plus",
    getDirections: "Itinéraire",
    callShop: "Appeler la boutique",
    whatsappShop: "WhatsApp la boutique",
    points: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
    items: (n: number) => `${n} ${n === 1 ? "article" : "articles"}`,
  },

  language: {
    label: "Langue",
    english: "English",
    french: "Français",
    switchTo: (name: string) => `Passer en ${name}`,
  },

  nav: {
    home: "Accueil",
    shop: "Boutique",
    bundles: "Lots",
    deals: "Promos",
    wholesale: "Gros",
    rewards: "Fidélité",
    about: "À propos",
    contact: "Contact",
    dashboard: "Mon compte",
    primary: "Principal",
    appearance: "Apparence",
  },

  header: {
    account: "Compte",
    signIn: "Se connecter",
    signedIn: "Connecté",
    searchPlaceholder: "Rechercher des produits…",
    cartLabel: "Panier",
    basket: "Panier",
  },

  search: {
    productsLabel: "Rechercher des produits",
    dialogLabel: "Recherche de produits",
    close: "Fermer la recherche",
    catalogue: "Rechercher dans le catalogue Goshen",
    enter: "Entrée",
    toSearch: "pour rechercher",
    esc: "Échap",
    toClose: "pour fermer",
    submit: "Rechercher",
  },

  footer: {
    openNow: "Ouvert",
    closedNow: "Fermé",
    eyebrow: "La boutique du quartier",
    headline: ["Faites vos courses", "près de chez", "vous."],
    lead: "Alimentation, maison et soins personnels,",
    leadEm: " commandés en ligne, payés à la livraison.",
    visitTitle: "Venir à la boutique",
    location: "Adresse",
    hours: "Horaires",
    call: "Téléphone",
    contactSupport: "Contact et assistance",
    explore: "Explorer",
    accountCol: "Compte",
    rewardsCol: "Fidélité",
    rewardsCopy: (signupBonus: number, referral: number, minPoints: number) =>
      `Gagnez 1,5 point par tranche de 100 FCFA. Recevez ${signupBonus} points quand un ami s'inscrit, puis ${referral} points de plus lors de sa première commande. Utilisez vos points dès ${minPoints} comme remise en boutique, non convertibles en espèces.`,
    howRewardsWork: "Comment fonctionne la fidélité",
    rightsReserved: (year: number) => `© ${year} Goshen. Tous droits réservés.`,
    termsLink: "Conditions",
    privacyLink: "Confidentialité",
    accountLinks: {
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      dashboard: "Mon compte",
      cart: "Panier",
    },
  },

  cart: {
    kicker: "Panier",
    title: "Panier",
    intro: "Vérifiez vos articles avant de commander. Les prix sont en FCFA.",
    loading: "Chargement du panier…",
    empty: "Votre panier est vide.",
    continueShopping: "Continuer mes achats",
    subtotal: "Sous-total",
    delivery: "Livraison",
    total: "Total",
    checkout: "Commander",
    remove: "Retirer",
    flavorTotal: (n: number) => `${n} au total`,
    removeOne: (flavor: string) => `Retirer un ${flavor}`,
    addOne: (flavor: string) => `Ajouter un ${flavor}`,
    quantityFor: (name: string) => `Quantité pour ${name}`,
    decreaseQty: (name: string) => `Réduire la quantité de ${name}`,
    increaseQty: (name: string) => `Augmenter la quantité de ${name}`,
    open: "Ouvrir le panier",
  },

  home: {
    heroDefaults: {
      kicker: "New Bell, Bamenda",
      headline: "Tout ce qu'il vous faut,",
      rotatingLines: [
        "juste au coin de la rue.",
        "livré partout à Bamenda.",
        "payé à la livraison.",
        "depuis la boutique de New Bell.",
      ],
      lead: "Alimentation, maison et soins personnels, commandés en ligne, payés à la livraison ou au retrait.",
      primaryCtaLabel: "Acheter",
      secondaryCtaLabel: "Promos du jour",
      imageAlt:
        "Un panier de courses rempli de produits frais et d'articles ménagers",
    },
    trust: {
      quality: "Produits de qualité",
      prices: "Prix justes en FCFA",
      delivery: "Livraison à Bamenda",
      payOnArrival: "Payez à la livraison",
    },
    ribbon: {
      openDaily: "Ouvert tous les jours",
      callWhatsapp: "Appel / WhatsApp",
      ourLocation: "Notre adresse",
      rewards: "Fidélité Goshen",
      rewardsDetail: "Gagnez des points à chaque achat",
    },
    shopByCategory: "Acheter par catégorie",
    todaysDeals: "Promos du jour",
    limitedTime: "Durée limitée",
    viewAllDeals: "Voir toutes les promos",
    newArrivals: "Nouveautés",
    justLanded: "Vient d'arriver",
    viewAllNewArrivals: "Voir toutes les nouveautés",
    nipzTeaser: {
      kicker: "Nipz Pretty Cakes & Pastries",
      title: "Gâteaux personnalisés, sur commande",
      body: "Gâteaux d'anniversaire, cupcakes et tables de desserts préparés à New Bell, Bamenda. Choisissez un modèle dans la galerie ou proposez votre propre idée, et nous nous occupons du reste.",
      cta: "Découvrir Nipz Pretty Cakes",
    },
    promoStayHome: "Restez chez vous. Nous vous apportons la boutique.",
    promoStayHomeBody:
      "Commandez alimentation et produits ménagers en livraison partout à Bamenda.",
    orderForDelivery: "Commander en livraison",
    referFriend: "Parrainer un ami",
    referFriendBody: (signupBonus: number, referral: number) =>
      `Gagnez ${signupBonus} points dès qu'un ami s'inscrit avec votre lien, puis ${referral} points de plus lors de sa première commande.`,
    getReferralLink: "Obtenir votre lien de parrainage",
    perks: {
      earnTitle: "Gagnez des points",
      earnBody: "1,5 point par 100 FCFA payés. 100 points à l'inscription.",
      redeemTitle: "Utilisez et économisez",
      redeemBody: (minPoints: number, maxPoints: number, minSubtotal: string) =>
        `Dès ${minPoints} points, 1 FCFA de remise par point sur les commandes à partir de ${minSubtotal}. Jusqu'à ${maxPoints} points par commande ; le reste est conservé. Non convertible en espèces.`,
      extrasTitle: "Avantages membres",
      extrasBody: "Promos exclusives et livraison fiable partout à Bamenda.",
    },
    testimonials: {
      kicker: "Nos clients",
      title: "Ce que disent les familles de Bamenda",
      averageSuffix: "d'après les acheteurs récents",
      starsOutOf5: (n: number) => `${n} étoiles sur 5`,
      verifiedOn: (date: string) => `Client vérifié · ${date}`,
    },
  },

  bundles: {
    kicker: "Gagnez du temps",
    title: "Lots",
    intro:
      "Des ensembles prêts à l'emploi à un seul prix. Toute une course en un clic.",
    empty: "Aucun lot pour le moment.",
    whatsInside: "Ce que contient le lot",
    someOut: "Un des produits de ce lot est en rupture de stock pour l'instant.",
    contains: "Contient :",
  },

  shop: {
    kickerCatalog: "Catalogue",
    kickerFeatured: "En vedette",
    titleShop: "Boutique",
    titleDeals: "Promos du jour",
    introShop: "Alimentation et produits ménagers, prix en FCFA.",
    introDeals: "Articles en vedette pour une durée limitée, prix en FCFA.",
    categoriesLabel: "Catégories",
    all: "Tous",
    nipzBannerDesc:
      "Gâteaux & pâtisseries sur commande. Parcourez la galerie et réservez en ligne",
    resultsFor: "Résultats pour",
    noProducts: "Aucun produit dans cette sélection pour l'instant.",
    choose: "Choisir",
    chooseFlavours: "Choisir les parfums",
    chooseFlavoursHint: "Indiquez la quantité de chaque parfum.",
    add: "Ajouter",
    addN: (n: number) => `Ajouter ${n} au panier`,
    removeFromWishlist: "Retirer des favoris",
    addToWishlist: "Ajouter aux favoris",
    saveToWishlist: "Ajouter aux favoris",
    savedToWishlist: "Ajouté aux favoris",
    backToShop: "Retour à la boutique",
    wholesaleLabel: "Gros",
    forApprovedBuyers: "pour les acheteurs professionnels approuvés",
    reviews: {
      title: "Avis",
      none: "Aucun avis pour l'instant. Les clients peuvent noter cet article après réception d'une commande.",
      summary: (avg: string, count: number) =>
        `${avg} · ${count} ${count === 1 ? "avis" : "avis"}`,
    },
    productFallbackTitle: "Produit",
  },

  checkout: {
    kicker: "Commande",
    title: "Commander",
    intro:
      "Choisissez la livraison ou le retrait. Le paiement se fait à la livraison ou au retrait. Les points servent uniquement de remise en boutique.",
    loading: "Chargement de la commande…",
    emptyCart: "Votre panier est vide.",
    continueShopping: "Continuer mes achats",
    fulfillment: "Mode de réception",
    deliveryInBamenda: "Livraison à Bamenda",
    pickupAtNewBell: "Retrait à New Bell",
    fullName: "Nom complet",
    phone: "Téléphone / WhatsApp",
    savedAddress: "Adresse enregistrée",
    default: "Par défaut",
    saveAddressesPre: "Enregistrez vos adresses dans votre",
    saveAddressesLink: "compte",
    saveAddressesPost: "pour aller plus vite la prochaine fois.",
    deliveryAddress: "Adresse de livraison",
    notes: "Remarques (facultatif)",
    orderSummary: "Récapitulatif de la commande",
    subtotal: "Sous-total",
    delivery: "Livraison",
    pointsDiscount: "Remise points",
    total: "Total",
    usePoints: (n: number) =>
      `Utiliser ${n} points comme remise en boutique. Les points ne sont pas convertis en espèces.`,
    pointsBelowMin: (n: number, minPoints: number) =>
      `Vous avez ${n} points. L'utilisation commence à ${minPoints} points.`,
    pointsNeedSubtotal:
      "Ajoutez des articles pour atteindre 1 000 FCFA avant d'utiliser vos points.",
    earnsNote: (earned: number, fee: string) =>
      `Cette commande rapporte ${earned} ${earned === 1 ? "point" : "points"} (1,5 point par 100 FCFA payés). Payez à la livraison ou au retrait. La livraison coûte ${fee} ; le retrait est gratuit.`,
    unableToPlace: "Impossible de passer la commande.",
    networkError: "Erreur réseau. Réessayez.",
    placingOrder: "Envoi de la commande…",
    placeOrder: "Passer la commande",
    payment: "Paiement",
    payCash: "Payer à la livraison ou au retrait (espèces)",
    payMomo: "Payer maintenant avec MTN MoMo",
    momoNumber: "Numéro MTN MoMo",
    momoHint:
      "Vous recevrez une demande sur ce numéro pour approuver le paiement avec votre code PIN.",
    pointsCashOnly:
      "Les points ne sont utilisables que sur les commandes en espèces.",
    payAmountMomo: (amount: string) => `Payer ${amount} avec MoMo`,
  },

  pay: {
    kicker: "Paiement",
    amount: "Montant",
    checkPhone: "Vérifiez votre téléphone",
    checkPhoneHint:
      "Approuvez la demande de paiement MTN MoMo avec votre code PIN. Cette page se met à jour automatiquement.",
    stillPending: "En attente d'approbation",
    stillPendingHint:
      "Cela prend plus de temps que d'habitude. Approuvez-le sur votre téléphone, ou revenez plus tard. Nous vous préviendrons dès que c'est validé.",
    keepWaiting: "Continuer à attendre",
    goToOrder: "Voir la commande",
    paid: "Paiement reçu. Redirection vers votre commande.",
    failed: "Le paiement n'a pas abouti",
    tryAgain: "Réessayer",
    cancelOrder: "Annuler cette commande",
    error: "Une erreur s'est produite. Réessayez.",
    finishPayment: "Terminer le paiement →",
  },

  about: {
    kicker: "À propos de Goshen",
    title: "L'épicerie de New Bell, Bamenda",
    intro:
      "Goshen est une épicerie et boutique de produits ménagers de quartier. Nous proposons l'alimentation du quotidien, les produits d'entretien et les soins personnels pour que les familles de Bamenda fassent leurs courses près de chez elles, ou se fassent livrer.",
    whereTitle: "Où nous trouver",
    howTitle: "Comment nous vendons",
    howBody:
      "Les prix sont en FCFA. Payez à la livraison ou au retrait en boutique. La livraison coûte 1 000 FCFA ; le retrait en boutique est gratuit.",
    browseShop: "Parcourir la boutique",
    contactUs: "Nous contacter",
  },

  contact: {
    kicker: "Contact",
    title: "Contacter la boutique",
    intro:
      "Des questions sur le stock, la livraison à Bamenda ou une commande ? Contactez-nous pendant les heures d'ouverture.",
    visitTitle: "Visiter",
    seeOnMap: "Voir sur la carte",
    callWhatsappTitle: "Appel ou WhatsApp",
    chatOnWhatsapp: "Discuter sur WhatsApp",
    sendMessage: "Envoyer un message",
    sendMessageHint: "Cela ouvre WhatsApp avec votre message prêt à envoyer.",
    yourName: "Votre nom",
    message: "Message",
    sendOnWhatsapp: "Envoyer sur WhatsApp",
    sentNote:
      "WhatsApp devrait s'ouvrir avec votre message. Sinon, appelez-nous.",
    waGreetingNamed: (name: string, message: string) =>
      `Bonjour Goshen, je suis ${name}. ${message}`,
    waGreeting: (message: string) => `Bonjour Goshen. ${message}`,
  },

  storeMap: {
    kicker: "Nous trouver",
    title: "Où se trouve la boutique",
    getDirections: "Itinéraire",
    mapTitle: (name: string, location: string) =>
      `Carte indiquant ${name} à ${location}`,
    tapPre: "Touchez la carte ou",
    tapLink: "ouvrez-la dans Google Maps",
    tapPost: "pour la navigation détaillée.",
  },

  auth: {
    kicker: "Compte",
    backToHome: "Retour à l'accueil",
    signInTitle: "Se connecter",
    signInIntro:
      "Continuez avec Google ou connectez-vous avec votre e-mail Goshen.",
    registerTitle: "Créer un compte",
    registerIntro:
      "Continuez avec Google ou créez un compte par e-mail. Les sessions utilisent des cookies HTTP-only.",
    continueWithGoogle: "Continuer avec Google",
    orCreateEmail: "ou créer par e-mail",
    orSignInEmail: "ou se connecter par e-mail",
    fullName: "Nom complet",
    email: "E-mail",
    password: "Mot de passe",
    referralNote: "Inscription avec le code de parrainage",
    somethingWrong: "Une erreur est survenue.",
    networkError: "Erreur réseau. Réessayez.",
    csrfError:
      "Impossible de préparer un formulaire sécurisé. Actualisez et réessayez.",
    googleSetup:
      "La connexion Google n'est pas encore configurée. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET au fichier .env, puis redémarrez l'application.",
    googleFailed:
      "La connexion Google n'a pas abouti. Utilisez http://localhost:3005 (et non 127.0.0.1), puis réessayez Continuer avec Google.",
    pleaseWait: "Veuillez patienter…",
    createAccount: "Créer un compte",
    signIn: "Se connecter",
    haveAccount: "Vous avez déjà un compte ?",
    newToGoshen: "Nouveau chez Goshen ?",
    createAnAccount: "Créer un compte",
    agreeIntro: "En créant un compte, vous acceptez nos",
    agreeAnd: "et notre",
  },

  rewards: {
    kicker: "Fidélité",
    title: "Des points à chaque achat",
    intro:
      "Gagnez des points à l'inscription, lors de vos achats, en parrainant un ami ou en évaluant un produit. Utilisez-les uniquement comme remise au paiement, jamais en espèces.",
    yourInvite: "Votre invitation",
    signInForLink: "Connectez-vous pour obtenir un lien de parrainage personnel.",
    openDashboard: "Ouvrir le tableau de bord",
    createAccount: "Créer un compte",
    startShopping: "Commencer mes achats",
    perks: {
      earnTitle: "Gagnez à chaque achat",
      earnBody:
        "Cumulez 1,5 point par tranche de 100 FCFA payés. Une commande de 1 000 FCFA rapporte 15 points.",
      referTitle: "Inscrivez-vous et parrainez",
      referBody: (welcome: number, signupBonus: number, referral: number) =>
        `Les nouveaux comptes reçoivent ${welcome} points. Vous gagnez ${signupBonus} points dès qu'un ami s'inscrit avec votre lien, puis ${referral} points de plus quand il passe sa première commande. Il reçoit tout de même ${welcome} points à l'inscription.`,
      reviewTitle: "Évaluez les produits",
      reviewBody: (review: number) =>
        `Après réception d'une commande, chaque avis produit ajoute ${review} points.`,
      redeemTitle: "Utilisez en boutique",
      redeemBody: (minPoints: number, maxPoints: number, minSubtotal: string) =>
        `Dès ${minPoints} points, utilisez-les comme remise sur votre prochaine commande de ${minSubtotal} ou plus. Jusqu'à ${maxPoints} points par commande ; le reste est conservé pour votre prochain achat. 1 point = 1 FCFA de remise. Les points ne sont pas versés en espèces.`,
    },
  },

  account: {
    kicker: "Tableau de bord",
    welcome: (name: string) => `Bienvenue, ${name}`,
    welcomeBack: (name: string) => `Bon retour, ${name}`,
    intro:
      "Profil, commandes, favoris, fidélité, notifications et adresses enregistrées.",
    navLabel: "Compte",
    nav: {
      profile: "Profil",
      orders: "Commandes",
      wishlist: "Favoris",
      rewards: "Fidélité",
      notifications: "Notifications",
      addresses: "Adresses",
    },
    signOut: "Se déconnecter",
    signingOut: "Déconnexion…",
    signOutError: "Impossible de se déconnecter. Réessayez.",

    profile: {
      title: "Profil",
      memberSince: (date: string) => `Membre depuis le ${date}.`,
      fullName: "Nom complet",
      email: "E-mail",
      phone: "Téléphone / WhatsApp",
      save: "Enregistrer le profil",
      saving: "Enregistrement…",
      saved: "Profil enregistré.",
      unableToSave: "Impossible d'enregistrer le profil.",
      networkError: "Erreur réseau. Réessayez.",
      uploadPhoto: "Téléverser une photo",
      changePhoto: "Changer de photo",
      removePhoto: "Supprimer",
      removing: "Suppression…",
      uploading: "Téléversement…",
      uploadFailed: "Échec du téléversement.",
      photoRemoveError: "Impossible de supprimer la photo.",
      viewPhoto: "Voir la photo",
      avatarHint:
        "JPG, PNG ou WEBP jusqu'à 5 Mo. Aide la boutique à vous reconnaître.",
    },

    stats: {
      orders: "Commandes",
      points: "Points",
      spent: "Dépensé",
      pending: "En attente",
      continueShopping: "Continuer mes achats",
    },

    wholesaleCard: {
      label: "Gros",
      approvedTitle: "Compte de gros actif",
      approvedCta: "Ouvrir le catalogue de gros",
      pendingTitle: "Demande de gros en cours d'examen",
      pendingCta: "Voir le statut",
      rejectedTitle: "Demande de gros non approuvée",
      rejectedCta: "Refaire une demande",
      noneTitle: "Achetez en gros à prix de gros",
      noneCta: "Faire une demande de gros",
    },

    orders: {
      title: "Mes commandes",
      empty: "Vous n'avez pas encore passé de commande.",
      startShopping: "Commencer mes achats",
      delivery: "Livraison",
      pickup: "Retrait",
      itemsCount: (n: number) => `${n} ${n === 1 ? "article" : "articles"}`,
      acceptedConfirm: "Acceptée · confirmez à la réception",
    },

    wishlist: {
      title: "Favoris",
      empty: "Enregistrez des produits pendant vos achats.",
      browse: "Parcourir la boutique",
    },

    rewards: {
      title: "Fidélité",
      pointsAmount: (n: number) => `${n} points`,
      redeemHint: (minPoints: number, maxPoints: number, minSubtotal: string) =>
        `Utilisez dès ${minPoints} points sur les commandes de ${minSubtotal} ou plus. Jusqu'à ${maxPoints} points par commande ; le reste est conservé pour votre prochain achat. 1 point = 1 FCFA de remise. Non convertible en espèces.`,
      redeemAtCheckout: "Utiliser au paiement",
      progressReady: "Prêt à échanger",
      progressLocked: "Continuez à gagner",
      progressToNext: (remaining: number) =>
        `${remaining} ${remaining === 1 ? "point" : "points"} avant votre prochaine récompense`,
      progressReadyBody: (points: number, value: string) =>
        `Vous pouvez échanger ${points} points contre ${value} de remise au paiement.`,
      progressNextMilestone: (remaining: number) =>
        `${remaining} de plus avant votre prochain palier`,
      referTitle: "Parrainer un ami",
      friendsSignedUp: "Amis inscrits",
      firstOrderRewards: "Récompenses de première commande",
      friendFirstOrder: (n: number) => `Première commande · ${n} points attribués`,
      friendWaiting: "Inscrit · en attente de la première commande",
      noReferralYet:
        "Votre lien de parrainage apparaîtra une fois la base de données connectée.",
      summary: (
        welcome: number,
        signupBonus: number,
        referral: number,
        review: number,
      ) =>
        `Inscription : ${welcome} points. Parrain : ${signupBonus} points dès qu'un ami s'inscrit, puis ${referral} points après sa première commande. Avis : ${review} points. Plus d'infos sur`,
      rewardsLink: "Fidélité",
    },

    notifications: {
      title: "Notifications",
      empty: "Les mises à jour de commande et alertes de fidélité apparaîtront ici.",
    },

    push: {
      title: "Alertes sur le téléphone",
      blurb:
        "Recevez une alerte sur ce téléphone pour chaque mise à jour de commande, réservation et récompense, même quand Goshen est fermé dans votre navigateur.",
      loading: "Vérification de cet appareil…",
      unsupported:
        "Ce navigateur ne peut pas afficher les alertes. Installez Goshen sur votre écran d'accueil et ouvrez-le depuis là.",
      blocked:
        "Les notifications sont bloquées pour Goshen dans les réglages de votre navigateur. Autorisez-les, puis rechargez cette page.",
      enable: "Activer les alertes",
      working: "En cours…",
      on: "Les alertes sont activées sur cet appareil.",
      disable: "Désactiver",
      test: "Envoyer une alerte test",
      testSent: "Envoyée. Elle devrait apparaître sur cet appareil dans un instant.",
      error: "Une erreur s'est produite. Réessayez.",
      nudge: {
        title: "Activer les notifications",
        body: "Ne manquez rien. Activez les notifications pour être alerté de vos commandes, réservations et récompenses.",
        steps:
          "Appuyez sur « Activer les notifications » ci-dessous, puis choisissez Autoriser quand votre navigateur le demande.",
      },
    },

    addresses: {
      title: "Adresses enregistrées",
      intro:
        "Conservez vos informations de livraison ici et réutilisez-les au paiement.",
      emptyHint:
        "Enregistrez une adresse de livraison pour un paiement plus rapide.",
      default: "Par défaut",
      edit: "Modifier",
      delete: "Supprimer",
      add: "Ajouter une adresse",
      unableToSave: "Impossible d'enregistrer l'adresse.",
      unableToDelete: "Impossible de supprimer l'adresse.",
      networkError: "Erreur réseau. Réessayez.",
      defaultLabel: "Maison",
      fieldLabel: "Libellé",
      fullName: "Nom complet",
      phone: "Téléphone",
      line: "Adresse",
      useAsDefault: "Utiliser comme adresse de livraison par défaut",
      saving: "Enregistrement…",
      save: "Enregistrer l'adresse",
      cancel: "Annuler",
    },
  },

  referral: {
    blurb: (signupBonus: number, referral: number, welcome: number) =>
      `Partagez ce lien. Vous gagnez ${signupBonus} points dès que votre ami crée un compte, puis ${referral} points de plus lors de sa première commande. Il reçoit ${welcome} points à l'inscription.`,
    yourCode: "Votre code :",
    linkLabel: "Lien de parrainage",
    copy: "Copier le lien",
    copied: "Copié",
    shareOnWhatsapp: "Partager sur WhatsApp",
    networkError: "Erreur réseau. Réessayez.",
    shareText: (url: string) =>
      `Rejoignez Goshen avec mon lien et gagnons tous les deux des points : ${url}`,
  },

  orders: {
    kicker: "Commande passée",
    wholesalePrefix: "Gros · ",
    delivery: "Livraison",
    pickup: "Retrait",
    wholesaleNote:
      "La boutique confirmera avec vous le prix final, les modalités de paiement et la livraison.",
    payNote: "Payez à la livraison ou au retrait.",
    items: "Articles",
    subtotal: "Sous-total",
    deliveryFee: "Livraison",
    arrangedAfter: "Fixée après confirmation",
    pointsDiscount: (n: number) => `Remise points (${n} pts)`,
    total: "Total",
    name: "Nom :",
    phone: "Téléphone :",
    address: "Adresse :",
    notes: "Remarques :",
    paymentMethod: "Mode de paiement :",
    paymentStatus: "Statut du paiement :",
    paymentMethodLabel: {
      CASH: "Espèces à la livraison / au retrait",
      MOMO: "MTN Mobile Money",
    },
    paymentStatusLabel: {
      PENDING: "En attente",
      SUCCEEDED: "Payé",
      FAILED: "Échoué",
    },
    backToOrders: "Retour aux commandes",
    receipt: {
      link: "Voir le reçu",
      kicker: "Reçu",
      receivedOn: (date: string) => `Réception confirmée le ${date}.`,
      keepForRecords: "Conservez ce reçu pour vos dossiers.",
      print: "Imprimer / enregistrer en PDF",
    },
    progress: {
      placed: "Passée",
      accepted: "Acceptée",
      received: "Reçue",
      cancelled: "Cette commande a été annulée.",
      statusSr: (label: string) => `Statut : ${label}`,
    },
    confirm: {
      title: "L'avez-vous reçue ?",
      body: "La boutique a accepté votre commande. Quand les articles arrivent ou que vous les récupérez, confirmez ici pour que nous sachions que la livraison est terminée.",
      saving: "Enregistrement…",
      button: "J'ai reçu ma commande",
      error: "Impossible de confirmer la réception.",
      networkError: "Erreur réseau. Réessayez.",
    },
    feedback: {
      title: "Partagez votre expérience",
      intro: (reviewPoints: number) =>
        `Un court témoignage aide les autres clients, et les avis produits nous indiquent quoi mettre davantage en stock. Chaque avis produit ajoute ${reviewPoints} points.`,
      testimonial: "Témoignage",
      howWas: "Comment était Goshen ?",
      testimonialPlaceholder:
        "Parlez-nous de la commande, de la livraison ou de la visite en boutique.",
      itemReviews: "Avis sur les articles",
      itemNotePlaceholder: "Remarque facultative sur cet article",
      saving: "Enregistrement…",
      update: "Mettre à jour l'avis",
      send: "Envoyer l'avis",
      thanks: "Merci. Votre avis est enregistré.",
      error: "Impossible d'enregistrer l'avis.",
      networkError: "Erreur réseau. Réessayez.",
    },
  },

  wholesale: {
    kicker: "Gros",
    metaDescription:
      "Achetez l'alimentation et les produits ménagers Goshen en gros à prix de gros.",
    catalogTitle: "Catalogue de gros",
    catalogIntro: (min: string) =>
      `Prix de gros pour les acheteurs professionnels approuvés. Commande minimum ${min}. La livraison est organisée avec vous après confirmation de votre commande par la boutique.`,
    viewCart: "Voir le panier de gros",
    catalogEmpty:
      "Aucun produit n'est disponible en gros pour l'instant. Revenez bientôt.",
    retail: "Détail",
    wholesalePrice: "Prix de gros",
    wholesaleLabel: "Gros",
    applyTitle: "Achetez en gros à prix de gros",
    applyIntro:
      "Goshen vend aux boutiques, restaurants, écoles et revendeurs à prix de gros. Faites une demande de compte de gros et, une fois approuvé, vous accéderez au catalogue de gros.",
    signInPrompt:
      "Connectez-vous ou créez un compte, puis demandez l'accès au gros.",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    pendingTitle: "Votre demande est en cours d'examen",
    pendingBody: (biz: string, phone: string) =>
      `Nous avons reçu votre demande${biz ? ` pour ${biz}` : ""}. La boutique vous contactera au ${phone} une fois approuvée.`,
    yourPhone: "votre téléphone",
    updateApplication: "Modifier ma demande",
    rejectedTitle: "Votre dernière demande n'a pas été approuvée",
    rejectedBody:
      "Contactez la boutique si vous pensez qu'il s'agit d'une erreur, ou soumettez une nouvelle demande plus détaillée.",
    submitNewApplication: "Soumettre une nouvelle demande",
    signedInPrompt:
      "Vous êtes connecté. Faites une demande de compte de gros pour commencer.",
    applyForWholesale: "Demander un compte de gros",
    applyPageTitle: "Demander un compte de gros",
    applyPageIntroPre:
      "Parlez-nous de votre entreprise. Une fois approuvé, vous verrez les prix de gros et pourrez commander en gros depuis le",
    applyPageIntroLink: "catalogue de gros",
    alreadyPending:
      "Vous avez déjà une demande en cours d'examen. La soumettre à nouveau la remplace.",
    businessName: "Nom de l'entreprise",
    businessType: "Type d'entreprise",
    phone: "Téléphone / WhatsApp",
    locationLabel: "Où l'entreprise est-elle située ?",
    locationPlaceholder: "ex. Nkwen, Bamenda",
    noteLabel: "Autre chose ? (facultatif)",
    notePlaceholder: "Ce que vous prévoyez d'acheter, volumes attendus, etc.",
    submitting: "Envoi…",
    unableToSubmit: "Impossible de soumettre la demande.",
    networkError: "Erreur réseau. Réessayez.",
    businessTypes: {
      "Retailer / shop": "Détaillant / boutique",
      "Restaurant / bar": "Restaurant / bar",
      "School / institution": "École / institution",
      "Reseller / distributor": "Revendeur / distributeur",
      Other: "Autre",
    } as Record<string, string>,
    retailPriceLine: (price: string, unit: string) =>
      `Prix de détail ${price} / ${unit}`,
    backToCatalog: "Retour au catalogue de gros",
    add: "Ajouter",
    quantityFor: (name: string) => `Quantité pour ${name}`,
    lineTotal: (unit: string, perUnit: string, total: string) =>
      `${unit} / ${perUnit} · total ligne ${total}`,
    added: "Ajouté.",
    viewCartShort: "Voir le panier",
    cartTitle: "Votre panier de gros",
    loadingCart: "Chargement du panier…",
    cartEmpty: "Votre panier de gros est vide.",
    browseCatalog: "Parcourir le catalogue de gros",
    remove: "Retirer",
    subtotal: "Sous-total",
    deliveryArranged:
      "La livraison est organisée après confirmation de votre commande par la boutique.",
    minOrderNote: (min: string) =>
      `Les commandes de gros démarrent à ${min}.`,
    checkout: "Commander",
    checkoutTitle: "Commande de gros",
    checkoutIntro:
      "Passez la commande et la boutique confirmera avec vous directement le prix final, les modalités de paiement et la livraison. Aucun point de fidélité ne s'applique aux commandes de gros.",
    loadingCheckout: "Chargement de la commande…",
    browseTheCatalog: "Parcourir le catalogue",
    fulfillment: "Mode de réception",
    deliveryOption: "Livraison (organisée avec vous après confirmation)",
    pickupOption: "Retrait à New Bell",
    contactName: "Nom du contact",
    deliveryAddress: "Adresse de livraison",
    notes: "Remarques (facultatif)",
    orderSummary: "Récapitulatif de la commande",
    termsConfirmed:
      "La livraison et les modalités de paiement sont confirmées par la boutique après votre commande.",
    unableToPlace: "Impossible de passer la commande.",
    placingOrder: "Envoi de la commande…",
    placeWholesaleOrder: "Passer la commande de gros",
  },

  pwa: {
    install: {
      title: "Ajoutez Goshen à votre téléphone",
      blurb:
        "Installez la boutique comme une application : une icône sur l'écran d'accueil, une navigation plein écran et un chargement plus rapide. Sans passer par un store.",
      action: "Installer l'application",
      iosHint:
        "Appuyez sur le bouton Partager dans Safari, puis choisissez « Sur l'écran d'accueil » pour installer Goshen.",
      dismiss: "Annuler",
    },
  },

  nipz: {
    metaDescription:
      "Gâteaux, cupcakes, pâtisseries et tables de desserts sur commande chez Goshen à New Bell, Bamenda. Réservez en ligne.",
    backToShop: "Retour à la boutique",
    eyebrow: "Chez Goshen · New Bell, Bamenda",
    title: "Nipz Pretty Cakes",
    titleEm: "& Pâtisseries",
    lead: "Gâteaux, pâtisseries & tables de desserts sur commande, cuits frais à New Bell, Bamenda. Chaque commande est réalisée sur mesure. Choisissez un style dans la galerie ou apportez votre propre idée.",
    bookACake: "Réserver un gâteau",
    browseGallery: "Parcourir la galerie",
    whatsappBakery: "WhatsApp la pâtisserie",
    stats: {
      madeToOrder: "Sur commande",
      madeToOrderLabel: "Aucun gâteau identique",
      daysNotice: (n: number) => `${n}+ jours`,
      daysNoticeLabel: "Délai pour le sur-mesure",
      pickupOrDelivery: "Retrait ou livraison",
      pickupOrDeliveryLabel: "Partout à Bamenda",
    },
    galleryKicker: "Le menu",
    galleryTitle: "Gâteaux & pâtisseries",
    galleryIntro:
      "Ce qui sort de la cuisine Goshen. Les prix sont un point de départ et varient selon la taille, les étages et les détails. Appuyez sur Commander sur WhatsApp pour confirmer.",
    galleryEmpty:
      "De nouvelles photos arrivent bientôt. Contactez la pâtisserie pour le menu actuel.",
    all: "Tous",
    signature: "Signature",
    priceOnRequest: "Prix sur demande",
    bookThis: "Réserver",
    orderOnWhatsapp: "Commander sur WhatsApp",
    orderMessage: (business: string, item: string) =>
      `Bonjour ${business}, je souhaite commander : ${item}. Merci de m'indiquer la disponibilité et le prix final.`,
    stepsKicker: "Comment réserver",
    stepsTitle: "Quatre étapes simples",
    steps: [
      {
        title: "Partagez votre idée",
        body: "Envoyez parfums, couleurs, nombre de parts et votre date via le formulaire ou sur WhatsApp.",
      },
      {
        title: "Recevez un devis",
        body: "La pâtisserie confirme la disponibilité et un prix final, généralement sous un jour.",
      },
      {
        title: "Validez & réservez",
        body: "Bloquez la date avec un acompte. Le solde est dû au retrait ou à la livraison.",
      },
      {
        title: "Remise fraîche",
        body: "Votre commande est cuite fraîche et prête au retrait à New Bell, ou livrée à Bamenda.",
      },
    ],
    bookEyebrow: "Réservez votre commande",
    bookTitle: "Dites-nous ce dont vous rêvez",
    bookChecks: [
      "Envoyez des photos d'inspiration sur WhatsApp après l'envoi.",
      "Un acompte réserve votre date ; le solde à la remise.",
      "Les commandes urgentes sont parfois possibles, demandez.",
    ],
    form: {
      yourName: "Votre nom",
      phone: "Téléphone / WhatsApp",
      email: "E-mail (facultatif)",
      occasion: "Occasion",
      choose: "Choisir…",
      cakeType: "Type de gâteau / pâtisserie",
      cakeTypePlaceholder: "ex. chocolat 2 étages, macarons",
      servings: "Nombre de parts / taille",
      servingsPlaceholder: "ex. 25 personnes",
      neededBy: "Pour le",
      neededByHint: (n: number) => `Merci de prévoir au moins ${n} jours.`,
      budget: "Budget en FCFA (facultatif)",
      budgetPlaceholder: "ex. 20000",
      collection: "Réception",
      pickupAtShop: "Retrait à la boutique",
      deliveryInBamenda: "Livraison à Bamenda",
      tellUs: "Parlez-nous du gâteau",
      tellUsPlaceholder:
        "Couleurs, thème, parfums, message sur le gâteau, photos d'inspiration que vous enverrez sur WhatsApp…",
      sending: "Envoi…",
      requestBooking: "Demander cette réservation",
      sendOnWhatsappInstead: "Envoyer plutôt sur WhatsApp",
      noPaymentNow:
        "Aucun paiement maintenant. La pâtisserie confirme d'abord la disponibilité et un prix final.",
      couldNotSend: "Impossible d'envoyer la réservation.",
      networkError:
        "Erreur réseau. Réessayez, ou envoyez la demande sur WhatsApp.",
      received:
        "Réservation reçue. Nous ouvrons WhatsApp pour que vous puissiez l'envoyer directement à la pâtisserie.",
      referenceLabel: (ref: string) => `Référence ${ref}`,
      whatsappDidntOpen:
        "Si WhatsApp ne s'est pas ouvert automatiquement, appuyez sur le bouton ci-dessous pour envoyer votre réservation à la pâtisserie.",
      sendOnWhatsapp: "Envoyer sur WhatsApp",
      newBooking: "Nouvelle réservation",
      wa: {
        intro: (bakery: string) =>
          `Bonjour ${bakery}, je souhaite réserver une commande de gâteau / pâtisserie.`,
        reference: (ref: string) => `Référence : ${ref}`,
        name: (v: string) => `Nom : ${v}`,
        phone: (v: string) => `Téléphone : ${v}`,
        occasion: (v: string) => `Occasion : ${v}`,
        flavor: (v: string) => `Parfum / type : ${v}`,
        servings: (v: string) => `Parts : ${v}`,
        neededBy: (v: string) => `Pour le : ${v}`,
        collection: (v: string) => `Réception : ${v}`,
        budget: (v: string) => `Budget : ${v} FCFA`,
        details: (v: string) => `Détails : ${v}`,
        orderItem: (name: string) => `Je souhaite commander : ${name}.`,
        delivery: "Livraison",
        pickup: "Retrait",
      },
    },
    occasions: {
      Birthday: "Anniversaire",
      Wedding: "Mariage",
      Anniversary: "Anniversaire de mariage",
      "Baby shower": "Baby shower",
      Graduation: "Remise de diplôme",
      "Corporate / event": "Entreprise / événement",
      "Just because": "Sans raison particulière",
    } as Record<string, string>,
  },

  theme: {
    toggle: "Changer de thème",
    switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre",
  },

  rating: {
    label: "Note",
    outOf: (n: number, max: number) => `${n} sur ${max} étoiles`,
    nStars: (n: number) => `${n} ${n === 1 ? "étoile" : "étoiles"}`,
  },

  assistant: {
    open: "Ouvrir l'assistant de la boutique",
    close: "Fermer l'assistant de la boutique",
    closeShort: "Fermer",
    title: "Assistant Goshen",
    subtitle: "Produits, commandes & points",
    greeting:
      "Bonjour ! Je peux vous aider à trouver des produits, suivre une commande ou utiliser vos points de fidélité. Posez-moi vos questions sur Goshen.",
    inputPlaceholder: "Posez une question sur un produit, une commande ou vos points…",
    send: "Envoyer",
    micLabel: "Enregistrer un message vocal",
    micStop: "Arrêter l'enregistrement",
    micRecording: "Écoute en cours… touchez pour arrêter",
    micTranscribing: "Transcription de votre enregistrement…",
    micPermissionDenied:
      "Accès au microphone refusé. Autorisez-le dans les paramètres de votre navigateur pour utiliser la voix.",
    micError: "Impossible d'utiliser le microphone. Veuillez réessayer.",
    voiceEnable: "Lire les réponses à voix haute",
    voiceDisable: "Arrêter la lecture à voix haute",
    suggestions: [
      "Avez-vous du riz et de l'huile de cuisine ?",
      "Que puis-je acheter avec mes points ?",
      "Suivre ma dernière commande",
      "Comment fonctionne la livraison ?",
    ],
    toolLabels: {
      search_products: "Recherche dans la boutique…",
      get_product_details: "Vérification de ce produit…",
      list_categories: "Chargement des catégories…",
      get_my_orders: "Recherche de vos commandes…",
      get_order_details: "Vérification de votre commande…",
      get_loyalty_status: "Vérification de vos points…",
      get_help_topic: "Recherche de cette information…",
      working: "En cours…",
    } as Record<string, string>,
    unavailable: "L'assistant est indisponible pour le moment.",
    somethingWrong: "Une erreur est survenue.",
    noAnswer: "Aucune réponse reçue. Veuillez réessayer.",
    networkProblem: "Problème réseau. Vérifiez votre connexion et réessayez.",
  },

  orderStatus: {
    AWAITING_PAYMENT: "Paiement en attente",
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    RECEIVED: "Reçue",
    CANCELLED: "Annulée",
  },

  terms: {
    kicker: "Mentions légales",
    title: "Conditions d'utilisation",
    updatedLabel: (date: string) => `Dernière mise à jour : ${date}`,
    intro:
      "Ces conditions régissent l'utilisation du site Goshen et vos achats auprès de nous à New Bell, Bamenda. En créant un compte, en passant une commande ou en utilisant autrement le site, vous les acceptez.",
    sections: [
      {
        heading: "1. Qui nous sommes",
        body: [
          "Goshen est une épicerie et magasin de produits ménagers de quartier basé à New Bell, Bamenda, au Cameroun, qui vend directement aux particuliers et, pour les acheteurs professionnels approuvés, à des prix de gros. Nipz Pretty Cakes & Pastries fait partie de Goshen et prend ses réservations sur sa propre ligne WhatsApp.",
        ],
      },
      {
        heading: "2. Votre compte",
        body: [
          "Vous pouvez créer un compte avec un e-mail et un mot de passe, ou en vous connectant avec Google. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité sur votre compte.",
          "Fournissez des informations exactes : votre nom, votre numéro de téléphone et votre adresse de livraison servent à traiter vos commandes et à vous contacter à leur sujet. Un compte par personne ; ne créez pas plusieurs comptes pour réclamer plusieurs fois les points de bienvenue ou de parrainage.",
        ],
      },
      {
        heading: "3. Commandes et paiement",
        body: [
          "Les prix sont affichés en FCFA. Vous pouvez payer en espèces à la livraison ou au retrait, ou par mobile money (MoMo) au moment du paiement. Une commande n'est confirmée qu'une fois que nous l'acceptons. Nous pouvons refuser ou annuler une commande si un article est en rupture de stock, si l'adresse de livraison est en dehors de notre zone de service, ou en cas de suspicion de fraude ou d'abus.",
          "Des frais de livraison fixes s'appliquent aux commandes livrées ; le retrait en boutique est toujours gratuit. Il vous appartient d'être joignable et de fournir une adresse et un numéro de téléphone corrects pour la livraison.",
        ],
      },
      {
        heading: "4. Points de fidélité et parrainage",
        body: [
          "Vous inscrire, dépenser, parrainer des amis et évaluer des produits vous fait gagner des points de fidélité, visibles dans votre compte. Les points ne peuvent être utilisés que comme remise au paiement, dans la limite indiquée par commande sur la page Fidélité. Ils ne sont jamais versés en espèces et ne peuvent pas être transférés entre comptes.",
          "Les récompenses de parrainage sont destinées à de véritables nouveaux clients. Nous pouvons refuser ou annuler des points obtenus par de faux comptes, de l'auto-parrainage ou tout autre abus du programme, et pouvons modifier à tout moment le programme de points, la valeur des points ou les limites d'utilisation.",
        ],
      },
      {
        heading: "5. Comptes grossistes",
        body: [
          "Les acheteurs professionnels peuvent demander des prix de gros. Nous examinons les demandes et pouvons les approuver, les refuser, ou suspendre ultérieurement le statut grossiste à notre discrétion. Le prix final, les modalités de paiement et la livraison d'une commande de gros sont confirmés directement avec vous après la commande ; les points de fidélité ne s'appliquent pas aux commandes de gros.",
        ],
      },
      {
        heading: "6. Avis et autres contenus",
        body: [
          "Vous pouvez évaluer un produit après réception d'une commande. Les avis doivent être honnêtes et basés sur votre propre expérience : aucun contenu offensant, trompeur ou faux. Nous pouvons supprimer un avis ou restreindre un compte qui ne respecte pas cette règle.",
        ],
      },
      {
        heading: "7. L'assistant d'achat",
        body: [
          "L'assistant d'achat du site vous aide à trouver des produits, suivre vos commandes et comprendre vos points de fidélité. Il ne peut ni passer de commande ni effectuer de paiement en votre nom, et ses réponses sont fournies à titre indicatif, sans garantie d'exactitude au-delà des données de votre propre compte et de vos commandes.",
        ],
      },
      {
        heading: "8. Utilisation autorisée",
        body: [
          "N'utilisez pas le site de manière abusive : pas d'extraction automatisée de données, de création automatisée de comptes, de tentative de contournement de la sécurité ou des limites de fréquence, ni d'interférence avec l'utilisation du site par d'autres clients.",
        ],
      },
      {
        heading: "9. Responsabilité",
        body: [
          "Nous nous efforçons de tenir à jour les informations produits, les prix et les niveaux de stock, mais des erreurs peuvent survenir et nous pouvons les corriger, y compris après qu'une commande a été passée. Dans la mesure permise par la loi, notre responsabilité pour toute réclamation liée à une commande est limitée au montant payé pour cette commande.",
        ],
      },
      {
        heading: "10. Modifications et résiliation",
        body: [
          "Nous pouvons modifier ces conditions de temps à autre ; la date en haut de page indique la dernière révision. Nous pouvons suspendre ou fermer un compte qui enfreint ces conditions.",
        ],
      },
      {
        heading: "11. Contact",
        body: [
          "Des questions sur ces conditions ? Contactez-nous par WhatsApp, par téléphone, ou via la page Contact.",
        ],
      },
    ],
  },

  privacy: {
    kicker: "Mentions légales",
    title: "Politique de confidentialité",
    updatedLabel: (date: string) => `Dernière mise à jour : ${date}`,
    intro:
      "Ce document explique quelles informations Goshen collecte lorsque vous utilisez le site, et comment elles sont utilisées.",
    sections: [
      {
        heading: "1. Informations que nous collectons",
        body: [
          "Détails du compte : votre nom, adresse e-mail, numéro de téléphone, adresse de livraison, et un mot de passe stocké de façon sécurisée. Nous ne stockons jamais votre mot de passe en clair. Si vous vous connectez avec Google, nous recevons votre nom, votre e-mail et votre identifiant de compte Google.",
          "Détails des commandes : articles achetés, choix de livraison ou de retrait, moyen de paiement et statut de la commande.",
          "Demandes grossiste : le nom et les informations de votre entreprise, si vous demandez des prix de gros.",
          "Contenu que vous ajoutez : avis produits, préférences de notification, et messages que vous nous envoyez.",
          "Informations d'utilisation : un identifiant visiteur anonyme stocké dans un cookie, ainsi que les pages que vous consultez, afin que nous puissions estimer la fréquentation du site. Nous notons aussi brièvement les adresses IP pour éviter les abus lors des inscriptions et de la navigation.",
        ],
      },
      {
        heading: "2. Cookies",
        body: [
          "Nous utilisons un petit nombre de cookies : un pour vous garder connecté, un pour la sécurité (protection CSRF), et un identifiant anonyme de longue durée utilisé uniquement pour compter les visites du site de façon globale. Il ne sert jamais à vous identifier personnellement.",
        ],
      },
      {
        heading: "3. Comment nous utilisons vos informations",
        body: [
          "Pour créer et gérer votre compte, traiter et livrer vos commandes, et vous contacter à leur sujet.",
          "Pour gérer le programme de points de fidélité et de parrainage, et pour envoyer des notifications de compte, de commande et de récompense, y compris des notifications push, uniquement si vous les activez.",
          "Pour répondre aux messages envoyés via la page Contact ou WhatsApp, et pour examiner les demandes grossiste.",
          "Pour comprendre la fréquentation globale du site et l'améliorer, à partir de données de visite agrégées et anonymisées.",
          "Pour assurer la sécurité de la plateforme et prévenir la fraude ou les abus des comptes, des commandes et du programme de parrainage.",
        ],
      },
      {
        heading: "4. Comment nous partageons vos informations",
        body: [
          "Nous ne vendons pas vos informations personnelles. Nous ne les partageons que lorsque c'est nécessaire au fonctionnement du site : avec notre prestataire de mobile money pour traiter un paiement MoMo que vous initiez, avec Google si vous choisissez de vous connecter avec Google, avec notre hébergeur d'images pour les photos produits, et avec le personnel qui prépare et livre votre commande.",
          "Nous pouvons divulguer des informations si la loi nous y oblige.",
        ],
      },
      {
        heading: "5. Durée de conservation",
        body: [
          "Nous conservons les informations de compte et de commande tant que votre compte est actif, puis aussi longtemps que nécessaire à des fins comptables et légales. Vous pouvez nous demander de supprimer votre compte et vos données personnelles à tout moment, sous réserve des registres que nous sommes tenus de conserver.",
        ],
      },
      {
        heading: "6. Vos choix",
        body: [
          "Vous pouvez mettre à jour les informations de votre profil à tout moment depuis votre compte, désactiver les notifications push depuis les réglages de votre appareil ou navigateur, et nous demander, via la page Contact ou WhatsApp, de consulter, corriger, exporter ou supprimer les informations personnelles que nous détenons sur vous.",
        ],
      },
      {
        heading: "7. Enfants",
        body: [
          "Le site de Goshen ne s'adresse pas aux enfants ; les comptes ne doivent être créés que par des adultes capables de passer et de payer des commandes.",
        ],
      },
      {
        heading: "8. Sécurité",
        body: [
          "Les mots de passe sont stockés par hachage à sens unique, jamais en clair, et votre session est conservée dans un cookie sécurisé et protégé (HTTP-only). Aucun service en ligne ne peut être garanti totalement sûr, mais nous prenons des mesures raisonnables pour protéger vos informations.",
        ],
      },
      {
        heading: "9. Modifications de cette politique",
        body: [
          "Nous pouvons mettre à jour cette politique de temps à autre ; la date en haut de page indique la dernière révision.",
        ],
      },
      {
        heading: "10. Contact",
        body: [
          "Pour toute question ou demande relative à la confidentialité, contactez-nous par WhatsApp, par téléphone, ou via la page Contact.",
        ],
      },
    ],
  },

  meta: {
    cart: "Panier",
    shop: "Boutique",
    checkout: "Commander",
    rewards: "Fidélité",
    about: "À propos",
    contact: "Contact",
    wholesale: "Gros",
    login: "Se connecter",
    register: "Créer un compte",
    account: "Mon compte",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
  },
};
