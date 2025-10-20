export const pterodactylConfig = {
  domain: process.env.DOMAIN_PANEL,
  apiKey: process.env.APIKEY_PANEL,
  nests: process.env.NESTS_PANEL,
  nestsGame: "2", // ga ubah di isi, ga perlu
  egg: process.env.EGG_PANEL,
  eggSamp: "16", // ga ubah di isi, ga perlu
  location: "1", // location panel 
}

export const appConfig = {
  whatsappGroupLink: "", // link group
  nameHost: "MTS4YOU", // nama host 
  feeMin: 50, //minimal fee
  feeMax: 300, // max fee 
  apikey: "CiaaTopUp_wrgpl88n6a47bth5", // apikey cia topup 
  emailSender: {
    host: "okfajri45@gmail.com", // Gmail host
    port: 587, // ga usa di ubah, ga guna 
    secure: false, // false in
    auth: {
      user: "", // Gmail buat ngirim ke Gmail buyer 
      pass: "", // sandi aplikasi 
    },
    from: "Kurir Panel <okfajri45@gmail.com>",
  }, // ganti sendiri 
  telegram: {
    botToken: "",
    ownerId: "",
  },
mongodb: {
       uri: "mongodb+srv://", // url mongo mu
    dbName: "pterodactyl",
  },
  okeconnect: {
    codeqr: "", 
    merchant: "",
    apikey: ""
  },
  socialMedia: {
    whatsapp: "https://wa.me/6283894064758",
    tiktok: "https://xnxx.com",
    instagram: "https://www.intagram.com/only48966"
  }
}
