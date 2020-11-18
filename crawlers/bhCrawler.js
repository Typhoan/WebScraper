const axios = require("axios");
const cheerio = require("cheerio");

const linkPrefix = "https://www.bhphotovideo.com";
const AUTO_NOTIFY = "NOTIFY WHEN AVAILABLE";
const SOLD_OUT = "SOLD OUT";
const PRE_ORDER = "PREORDER";
const SOURCE = "B&H|";

var methods = {};
var productLinks = [];

methods.GetBHProducts = async function (Url, TestMode = false) {
  CheckForInstock = (product, link, buttonText) => {
    if (
      !buttonText.includes(AUTO_NOTIFY) &&
      !buttonText.includes(SOLD_OUT) &&
      !buttonText.includes(PRE_ORDER)
    ) {
      productLinks.push(SOURCE + product + "|" + link);
    }
  };

  CheckForExistence = (product, link, buttonText) => {
    if (
      buttonText.includes(AUTO_NOTIFY) ||
      buttonText.includes(SOLD_OUT) ||
      buttonText.includes(PRE_ORDER)
    ) {
      productLinks.push(SOURCE + product + "|" + link);
    }
  };

  isNullOrUndefined = (value) => {
    return value === null || value === undefined;
  };

  try {
    productLinks = [];
    const { data } = await axios.get(Url);
    const $ = cheerio.load(data);
    var $elements = $("div[data-selenium=miniProductPageProduct]");

    for (const el of $elements.toArray()) {
      var linkObj = $(el).find(
        "a[data-selenium=miniProductPageProductNameLink]"
      );
      var productObj = $(el).find(
        "span[data-selenium=miniProductPageProductName]"
      );
      var link = linkPrefix + $(linkObj).attr("href").toString();
      var product = $(productObj).text();
      
      $(el).find("button[data-selenium=addToCartButton]").each((_idx, btn) => {
        var buttonText = $(btn).text().toUpperCase();
        if (!TestMode && !isNullOrUndefined(buttonText)) {
          CheckForInstock(product, link, buttonText);
        } else {
          CheckForExistence(product, link, buttonText);
        }
      });

      $(el).find("button[data-selenium=notifyAvailabilityButton]").each((_idx, btn) => {
        var buttonText = $(btn).text().toUpperCase();
        if (TestMode && !isNullOrUndefined(buttonText)) {
          CheckForExistence(product, link, buttonText);
        }
      });
    }
    return productLinks;
  } catch (error) {
    throw error;
  }
};

module.exports = methods;
