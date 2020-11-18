const BestBuy = require("./bestbuyCrawler");
const NewEgg = require("./neweggCrawler");
const BH = require("./bhCrawler");

const methods = {};

var Products = [];

methods.GetProducts = async function (UrlDictionary, TestMode) {
  Products = [];
  try {
    if (UrlDictionary["NeweggUrl"] !== "") {
      (
        await NewEgg.GetNewEggProducts(UrlDictionary["NeweggUrl"], TestMode)
      ).forEach((element) => Products.push(element));
    }
  } catch (error) {
    console.log(error);
  }
  try {
    if (UrlDictionary["BestBuyUrl"] !== "") {
      (
        await BestBuy.GetBestBuyProducts(UrlDictionary["BestBuyUrl"], TestMode)
      ).forEach((element) => Products.push(element));
    }
  } catch (error) {
    console.log(error);
  }
  try {
    if (UrlDictionary["BHUrl"] !== "") {
      (
        await BH.GetBHProducts(UrlDictionary["BHUrl"], TestMode)
      ).forEach((element) => Products.push(element));
    }
  } catch (error) {
    console.log(error);
  }

  return Products;
};

module.exports = methods;
