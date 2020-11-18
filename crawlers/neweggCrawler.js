const axios = require("axios");
const cheerio = require("cheerio");
const { isNullOrUndefined } = require("util");

const linkPrefix = "https://www.newegg.com";
const AUTO_NOTIFY = "AUTO NOTIFY";
const SOLD_OUT = "SOLD OUT";
const SOURCE = "Newegg|";

var methods = {};
var productLinks = [];

methods.GetNewEggProducts = async function (Url, TestMode = false) {
  CheckForInstock = (product, link, buttonText) => {
    if (!buttonText.includes(AUTO_NOTIFY) && !buttonText.includes(SOLD_OUT)) {
      productLinks.push(SOURCE + product + "|" + link);
    }
  };

  CheckForExistence = (product, link, buttonText) => {
    if (buttonText.includes(AUTO_NOTIFY) || buttonText.includes(SOLD_OUT)) {
      productLinks.push(SOURCE + product + "|" + link);
    }
  };

  GetIndividualLink = async (product, link) => {
    try {
      var $html2 = await axios.get(link);
      var $ = cheerio.load($html2.data);
      $("span.btn.btn-message.btn-wide").each((_idx, btn) => {
        var buttonText = $(btn).text().toUpperCase();
        if (!TestMode && !isNullOrUndefined(buttonText)) {
          CheckForInstock(product, link, buttonText);
        } else {
          CheckForExistence(product, link, buttonText);
        }
      });

      $("a[class=atnPrimary]").each((_idx, btn) => {
        var buttonText = $(btn).text().toUpperCase();
        if (!TestMode && !isNullOrUndefined(buttonText)) {
          CheckForInstock(product, link, buttonText);
        } else {
          CheckForExistence(product, link, buttonText);
        }
      });
    } catch (error) {
      throw error;
    }
  };

  try {
    productLinks = [];
    const { data } = await axios.get(
        Url
    );
    const $ = cheerio.load(data);
    var $elements = $("div[class=item-container]");

    for (const el of $elements.toArray()) {
      var productObj = $(el).find("a[class=item-title]");
      var link = $(productObj).attr("href").toString();
      var product = $(productObj).text();
      await GetIndividualLink(product, link);
    }
    return productLinks;
  } catch (error) {
    throw error;
  }
};

module.exports = methods;
