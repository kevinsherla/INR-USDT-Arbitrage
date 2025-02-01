let usdToInrRate = 0; // Variable to store the fetched USD to INR rate
let usdtToInrRate = 0; // Variable to store the fetched USDT to INR rate

// Fetch Current USD to INR Rate from ExchangeRate-API
async function fetchUsdToInrRate() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data && data.rates && data.rates.INR) {
            usdToInrRate = parseFloat(data.rates.INR).toFixed(2); // Extract and format the rate
            updateFieldWithSymbol('usd-to-inr', usdToInrRate, '₹'); // Display it with ₹ symbol
            updateConvertedUsd(); // Update converted amount dynamically
            calculateTotalUsdtReceived(); // Calculate Total USDT Received dynamically
            calculateTotalInr(); // Calculate Total INR dynamically
            calculateInrReceivedAndProfit(); // Calculate INR Received and Profit dynamically
        } else {
            alert("USD to INR rate not found");
        }
    } catch (error) {
        alert("Error fetching USD to INR rate");
        console.error("Error fetching USD to INR rate:", error);
    }
}

// Fetch Current USDT to INR Rate from CoinDCX API
async function fetchUsdtToInrRate() {
    try {
        const response = await fetch('https://api.coindcx.com/exchange/ticker');
        const data = await response.json();

        // Find the market data for USDTINR
        const usdtInrMarket = data.find(market => market.market === "USDTINR");

        if (usdtInrMarket) {
            usdtToInrRate = parseFloat(usdtInrMarket.last_price).toFixed(2); // Extract last_price as the rate
            updateFieldWithSymbol('usdt-to-inr', usdtToInrRate, '₹'); // Display it with ₹ symbol
            calculateTotalUsdtReceived(); // Calculate Total USDT Received dynamically
            calculateTotalInr(); // Calculate Total INR dynamically
            calculateInrReceivedAndProfit(); // Calculate INR Received and Profit dynamically
        } else {
            alert("USDT to INR market not found");
        }
    } catch (error) {
        alert("Error fetching USDT to INR rate");
        console.error("Error fetching USDT to INR rate:", error);
    }
}

// Real-time conversion of INR to USD
function updateConvertedUsd() {
    const inrAmount = parseFloat(removeSymbol(document.getElementById('inr-amount').value));
    const usdToInrInputValue = parseFloat(removeSymbol(document.getElementById('usd-to-inr').value));

    if (!isNaN(inrAmount) && !isNaN(usdToInrInputValue) && usdToInrInputValue > 0) {
        const convertedUsd = (inrAmount / usdToInrInputValue).toFixed(2); // Convert INR to USD
        updateFieldWithSymbol('converted-usd', convertedUsd, '$'); // Display it with $ symbol
    } else {
        document.getElementById('converted-usd').value = ""; // Clear the field if input is invalid
    }
}

// Calculate Total USDT Received
function calculateTotalUsdtReceived() {
    const convertedUsd = parseFloat(removeSymbol(document.getElementById('converted-usd').value));
    const wireFee = parseFloat(removeSymbol(document.getElementById('wire-fee-usd').value));
    const conversionFeePercentage = parseFloat(document.getElementById('usd-to-usdt-fee').value);
    const transferFee = parseFloat(removeSymbol(document.getElementById('network-fee-usd').value));

    if (!isNaN(convertedUsd) && !isNaN(wireFee) && !isNaN(conversionFeePercentage) && !isNaN(transferFee)) {
        let remainingAmount = convertedUsd - wireFee; // Subtract Wire Transfer Fee

        const conversionFee = remainingAmount * (conversionFeePercentage / 100); // Subtract Conversion Fee
        remainingAmount -= conversionFee;

        remainingAmount -= transferFee; // Subtract Network Fee

        updateFieldWithSymbol('total-usdt-received', remainingAmount.toFixed(2), '$');
        calculateTotalInr(); // Update Total INR dynamically

    } else {
        document.getElementById('total-usdt-received').value = ""; // Clear field if invalid input exists
    }
}

// Calculate Total INR based on Total USDT Received and Current USDT to INR Rate
function calculateTotalInr() {
    const totalUsdtReceived = parseFloat(removeSymbol(document.getElementById('total-usdt-received').value));
    const usdtToInrRateValue = parseFloat(removeSymbol(document.getElementById('usdt-to-inr').value));

    if (!isNaN(totalUsdtReceived) && !isNaN(usdtToInrRateValue)) {
        const totalInr = totalUsdtReceived * usdtToInrRateValue; // Calculate Total INR
        updateFieldWithSymbol('total-inr', totalInr.toFixed(2), '₹');
    } else {
        document.getElementById('total-inr').value = ""; // Clear field if invalid input exists
    }
}

// Calculate Final INR Received and Profit after all fees
function calculateInrReceivedAndProfit() {
  const totalInr = parseFloat(removeSymbol(document.getElementById('total-inr').value));
  const exchangeFeePercentage = parseFloat(document.getElementById('exchange-fee').value);
  const gstFeePercentage = parseFloat(document.getElementById('gst-fee').value);
  const tdsPercentage = parseFloat(document.getElementById('tds').value);
  const miscFeeInINR = parseFloat(removeSymbol(document.getElementById('miscellaneous-fee-inr').value));
  const miscFeeInUSD = parseFloat(removeSymbol(document.getElementById('miscellaneous-fee-usd').value));

  if (!isNaN(totalInr)) {
    const exchangeFee = totalInr * (exchangeFeePercentage / 100);
    const gstFee = exchangeFee * (gstFeePercentage / 100);
    const tdsFee = totalInr * (tdsPercentage / 100);
    const miscFeesConvertedToINR =
      miscFeeInUSD * usdToInrRate + (!isNaN(miscFeeInINR) ? miscFeeInINR : 0);

    const finalINRReceived =
      totalInr - exchangeFee - gstFee - tdsFee - miscFeesConvertedToINR;

    updateFieldWithSymbol('inr-received', finalINRReceived.toFixed(2), '₹');

    const initialAmountINR = parseFloat(removeSymbol(document.getElementById('inr-amount').value));

    if (!isNaN(initialAmountINR)) {
      // Calculate Profit
      const profit = finalINRReceived - initialAmountINR;
      updateFieldWithSymbol('profit-field', profit.toFixed(2), '₹');

      // Calculate Profit Margin (percentage)
      const profitMargin = ((profit / initialAmountINR) * 100).toFixed(2);
      updateFieldWithSymbol('profit-margin', profitMargin, '%');
    }
  }
}


// Utility function: Add a currency symbol dynamically
function updateFieldWithSymbol(fieldId, value, symbol) {
  document.getElementById(fieldId).value = `${symbol} ${value}`;
}

// Utility function: Remove a currency symbol from a value
function removeSymbol(value) {
  return value.replace(/[₹$]/g, '').trim();
}

// Add event listeners for Fetch buttons and real-time updates
document.getElementById('fetch-usd-to-inr').addEventListener('click', fetchUsdToInrRate);
document.getElementById('fetch-usdt-to-inr').addEventListener('click', fetchUsdtToInrRate);

// Automatically fetch rates on page load and set up listeners
window.onload = function () {
  fetchUsdToInrRate();
  fetchUsdtToInrRate();

  document.getElementById('inr-amount').addEventListener('input', function () {
      updateConvertedUsd();
      calculateTotalUsdtReceived();
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });

  document.getElementById('usd-to-inr').addEventListener('input', function () { 
      updateConvertedUsd();
      calculateTotalUsdtReceived();
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });

  document.getElementById('wire-fee-usd').addEventListener('input', function () {
      calculateTotalUsdtReceived();
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });

  document.getElementById('usd-to-usdt-fee').addEventListener('input', function () {
      calculateTotalUsdtReceived();
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });

  document.getElementById('network-fee-usd').addEventListener('input', function () {
      calculateTotalUsdtReceived();
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });

  document.getElementById('exchange-fee').addEventListener('input', calculateInrReceivedAndProfit);
  document.getElementById('gst-fee').addEventListener('input', calculateInrReceivedAndProfit);
  document.getElementById('tds').addEventListener('input', calculateInrReceivedAndProfit);
  document.getElementById('miscellaneous-fee-inr').addEventListener('input', calculateInrReceivedAndProfit);
  document.getElementById('miscellaneous-fee-usd').addEventListener('input', calculateInrReceivedAndProfit);

  document.getElementById('usdt-to-inr').addEventListener('input', function () { 
      calculateTotalInr();
      calculateInrReceivedAndProfit();
  });
};
