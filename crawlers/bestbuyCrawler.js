const axios = require("axios");
const cheerio = require("cheerio");

const linkPrefix = "https://www.bestbuy.com";
const SOURCE = "BestBuy|";
const AUTO_NOTIFY = "AUTO NOTIFY";
const SOLD_OUT = "SOLD OUT";
const CHECK_STORES = "CHECK STORES";
const SHOP_OPEN_BOX = "SHOP OPEN-BOX";
const COMING_SOON = "COMING SOON";

const methods = {};
var productLinks = [];

methods.GetBestBuyProducts = async function (Url, TestMode = false) {
  isNullOrUndefined = (value) => {
    return value === null || value === undefined;
  };

  GetIndividualLink = async (product, link) => {
    try {
      var $html2 = await axios.get(link);
      var $ = cheerio.load($html2.data);
      $("button.btn.btn-disabled.btn-lg.btn-block.add-to-cart-button").each(
        (_idx, btn) => {
          var buttonText = $(btn).text().toUpperCase();
          if (!TestMode && !isNullOrUndefined(buttonText)) {
            if (
              !buttonText.includes(AUTO_NOTIFY) &&
              !buttonText.includes(SOLD_OUT) &&
              !buttonText.includes(CHECK_STORES) &&
              !buttonText.includes(SHOP_OPEN_BOX) &&
              !buttonText.includes(COMING_SOON)
            ) {
              productLinks.push(SOURCE + product + "|" + link);
            }
          } else {
            if (
              buttonText.includes(AUTO_NOTIFY) ||
              buttonText.includes(SOLD_OUT) ||
              buttonText.includes(CHECK_STORES) ||
              buttonText.includes(SHOP_OPEN_BOX) ||
              buttonText.includes(COMING_SOON)
            ) {
              productLinks.push(SOURCE + product + "|" + link);
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  try {
    const { data } = await axios.get(Url);
    const $ = cheerio.load(data);
    productLinks = [];
    var $elements = $("div[class=right-column]");

    for (const el of $elements.toArray()) {
      var productObj = $(el).find("h4[class=sku-header]");
      var linkObj = productObj.find("a").first();
      var link = linkPrefix + $(linkObj).attr("href");
      var product = $(linkObj).text();
      await GetIndividualLink(product, link);
    }

    return productLinks;
  } catch (error) {
    throw error;
  }
};

module.exports = methods;
