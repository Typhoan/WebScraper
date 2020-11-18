const BestBuy = require("./bestbuyCrawler");
const NewEgg = require("./neweggCrawler");

const methods = {};

var Products = [];

methods.GetProducts = async function (UrlDictionary, TestMode) {
  Products = [];
  try {
    (
      await NewEgg.GetNewEggProducts(
        UrlDictionary["NeweggUrl"], TestMode
      )
    ).forEach((element) => Products.push(element));

    (
      await BestBuy.GetBestBuyProducts(
        UrlDictionary["BestBuyUrl"], TestMode

      )
    ).forEach((element) => Products.push(element));

    return Products;
  } catch (error) {
    throw error;
  }
};

module.exports = methods;
