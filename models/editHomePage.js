// const mongoose = require('mongoose');
//
// const editHomePageSchema = new mongoose.Schema({
//   logoUrl: { type: String, default: "" },
//   homeHeader: { type: String, default: "" },
//   homeParagraph: { type: String, default: "" },
//   aboutText: { type: String, default: "" },
//   contactText: { type: String, default: "" },
//   termsText: { type: String, default: "" }
// }, { timestamps: true });
//
// module.exports = mongoose.model("EditHomePage", editHomePageSchema);

const mongoose = require("mongoose");

const editIndexSchema = new mongoose.Schema({
  logoUrl: { type: String, default: "" },
  logoShape: { type: String, default: "default" },

  homeWebsitename: { type: String, default: "" },
  homeHeader: { type: String, default: "" },
  homeParagraph: { type: String, default: "" },

  aboutText: { type: String, default: "" },

  contactHeader: { type: String, default: "" },
  contactAddress: { type: String, default: "" },
  contactMobile: { type: String, default: "" },
  contactEmail: { type: String, default: "" },
  contactMessage: { type: String, default: "" },
  contactTriggeredEmail: { type: String, default: "" },

  termsAndConditionsHeader: { type: String, default: "" },
  termsAndConditionsText: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("EditIndexPage", editIndexSchema);
