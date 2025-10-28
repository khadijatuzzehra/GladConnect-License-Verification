import axios from "axios";

export async function callGoogleShoppingAPI(query: string) {
  const url = `https://real-time-product-search.p.rapidapi.com/search-light-v2?q=${query}&country=us&language=en&page=1&limit=10&sort_by=BEST_MATCH&product_condition=ANY&return_filters=false`;
  const headers = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    "x-rapidapi-key": "47aa6c7891msh33b3ce7474d2630p16e8c4jsn15127aa5dec8",
  };

  try {
    const response = await axios.get(url, {
      headers,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
