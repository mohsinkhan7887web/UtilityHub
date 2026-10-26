document.addEventListener("DOMContentLoaded", function () {

    /* Calculator 1:
       What is X% of Y?
    */

    const percentOfPercent = document.getElementById("percentOfPercent");
    const percentOfNumber = document.getElementById("percentOfNumber");
    const calculatePercentOf = document.getElementById("calculatePercentOf");
    const percentOfResult = document.getElementById("percentOfResult");


    calculatePercentOf.addEventListener("click", function () {

        const percentage = parseFloat(percentOfPercent.value);
        const number = parseFloat(percentOfNumber.value);

        if (isNaN(percentage) || isNaN(number)) {
            percentOfResult.textContent = "Enter both values";
            return;
        }

        const result = (percentage / 100) * number;

        percentOfResult.textContent = formatNumber(result);
    });



    /* Calculator 2:
       X is what % of Y?
    */

    const whatPercentX = document.getElementById("whatPercentX");
    const whatPercentY = document.getElementById("whatPercentY");
    const calculateWhatPercent = document.getElementById("calculateWhatPercent");
    const whatPercentResult = document.getElementById("whatPercentResult");


    calculateWhatPercent.addEventListener("click", function () {

        const x = parseFloat(whatPercentX.value);
        const y = parseFloat(whatPercentY.value);

        if (isNaN(x) || isNaN(y)) {
            whatPercentResult.textContent = "Enter both values";
            return;
        }

        if (y === 0) {
            whatPercentResult.textContent = "Cannot divide by zero";
            return;
        }

        const result = (x / y) * 100;

        whatPercentResult.textContent =
            formatNumber(result) + "%";
    });



    /* Calculator 3:
       Percentage Increase / Decrease
    */

    const oldValue = document.getElementById("oldValue");
    const newValue = document.getElementById("newValue");
    const calculateChange = document.getElementById("calculateChange");
    const changeResult = document.getElementById("changeResult");


    calculateChange.addEventListener("click", function () {

        const oldNumber = parseFloat(oldValue.value);
        const newNumber = parseFloat(newValue.value);

        if (isNaN(oldNumber) || isNaN(newNumber)) {
            changeResult.textContent = "Enter both values";
            return;
        }

        if (oldNumber === 0) {
            changeResult.textContent = "Cannot calculate from zero";
            return;
        }

        const change =
            ((newNumber - oldNumber) / Math.abs(oldNumber)) * 100;


        if (change > 0) {

            changeResult.textContent =
                "Increase: " + formatNumber(change) + "%";

        } else if (change < 0) {

            changeResult.textContent =
                "Decrease: " + formatNumber(Math.abs(change)) + "%";

        } else {

            changeResult.textContent = "No change";

        }

    });



    /* Calculator 4:
       Add Percentage
    */

    const baseValue = document.getElementById("baseValue");
    const adjustmentPercent = document.getElementById("adjustmentPercent");

    const addPercent = document.getElementById("addPercent");
    const subtractPercent = document.getElementById("subtractPercent");

    const adjustmentResult = document.getElementById("adjustmentResult");


    addPercent.addEventListener("click", function () {

        const number = parseFloat(baseValue.value);
        const percentage = parseFloat(adjustmentPercent.value);

        if (isNaN(number) || isNaN(percentage)) {
            adjustmentResult.textContent = "Enter both values";
            return;
        }

        const result =
            number + (number * percentage / 100);

        adjustmentResult.textContent =
            formatNumber(result);
    });



    /* Calculator 4:
       Subtract Percentage
    */

    subtractPercent.addEventListener("click", function () {

        const number = parseFloat(baseValue.value);
        const percentage = parseFloat(adjustmentPercent.value);

        if (isNaN(number) || isNaN(percentage)) {
            adjustmentResult.textContent = "Enter both values";
            return;
        }

        const result =
            number - (number * percentage / 100);

        adjustmentResult.textContent =
            formatNumber(result);
    });



    /* Number formatting */

    function formatNumber(number) {

        if (!Number.isFinite(number)) {
            return "0";
        }

        return Number(number.toFixed(8)).toLocaleString("en-IN");
    }

});