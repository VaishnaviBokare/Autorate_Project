



///////ekatra wala
document.addEventListener("DOMContentLoaded", function () {
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');

    let currentStep = 0;

    function showStep(n) {
        formSteps[currentStep].classList.remove('active');
        stepIndicators[currentStep].classList.remove('active');
        currentStep = (currentStep + n) % formSteps.length;
        formSteps[currentStep].classList.add('active');
        stepIndicators[currentStep].classList.add('active');
    }

    nextBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            showStep(1);
        });
    });

    prevBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            showStep(-1);
        });
    });

    submitBtn.addEventListener('click', () => {
        // Get form data
        var formData = new FormData(document.getElementById('car-form'));

        // Send AJAX POST request
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(response => {
            // Update the current page content with the response
            document.getElementById('chart').innerHTML = response;
        })
        .catch(error => console.error('Error:', error));
    });

    // Additional code for handling slider
    const slider = document.getElementById("kilometers-driven");
    const selectedKmValue = document.getElementById("selected-km-value");

    slider.addEventListener("input", function () {
        selectedKmValue.textContent = this.value;
    });

    // Model specific code
    document.getElementById('brand-name').addEventListener('change', function () {
        var make = this.value;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/models?make=' + make, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var models = JSON.parse(xhr.responseText);
                var modelSelect = document.getElementById('model-name');
                modelSelect.innerHTML = '';
                models.forEach(function (model) {
                    var option = document.createElement('option');
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
                document.getElementById('body-type').value = '';
            }
        };
        xhr.send();
    });

    document.getElementById('model-name').addEventListener('change', function () {
        var model = this.value;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/types?model=' + model, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var type = JSON.parse(xhr.responseText).type;
                document.getElementById('body-type').value = type;
                fetchSeats(model);
                fetchEngine(document.getElementById('brand-name').value, model);
            }
        };
        xhr.send();
    });

    function fetchSeats(model) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/seats?model=' + model, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var seats = JSON.parse(xhr.responseText).seats;
                document.getElementById('seats').value = seats;
            }
        };
        xhr.send();
    }

    function fetchEngine(brand, model) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/engine?brand=' + brand + '&model=' + model, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var engine = JSON.parse(xhr.responseText).engine;
                document.getElementById('engine').value = engine;
            }
        };
        xhr.send();
    }
       
    
 



});


document.addEventListener('DOMContentLoaded', function() {
    // Get the prediction result from the hidden input field
    var predictionResultInput = document.getElementById('prediction-result');
    if (predictionResultInput) {
        // Parse the prediction result as a float
        var modelPrice = parseFloat(predictionResultInput.value);

        // Check if the model price is a valid number
        if (!isNaN(modelPrice)) {
            setupGaugeChart(modelPrice);
        } else {
            console.error("Invalid prediction result:", predictionResultInput.value);
        }
    } else {
        console.error("Prediction result input not found.");
    }
});

function setupGaugeChart(modelPrice) {
    // Your chart setup code goes here
    // Use the modelPrice variable in your chart setup instead of directly accessing prediction-result

    console.log("Model price:", modelPrice);
     
    let phed = document.querySelector("#phed");

    let minPrice = 10000; // 1 lakh
    let maxPrice = 100000; // 1 crore

    var lakh = Math.floor(modelPrice / 100).toLocaleString('en-IN');

    // Extract the remaining part
    var remainder = (modelPrice % 100).toLocaleString('en-IN');

    // Format lakh part
    var formattedPrice = "₹" + lakh.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") + ',' + remainder;

    console.log(formattedPrice); // Output: ₹1,02,45,000

    // Display the formatted price
    phed.innerHTML = formattedPrice + " Rupees!";

    am4core.useTheme(am4themes_animated);

    var chartMin = modelPrice - 200000;
    var chartMax = modelPrice + 500000; // 2 crore

    var data = {
        score: 0,
        gradingData: [
            {
                title: "Low Price",
                advice: "Considerably below market average",
                color: "#FFB74D",
                lowScore: 0,
                highScore: modelPrice - 100000
            },
            {
                title: "Moderate Price",
                advice: "Below market average",
                color: "#81C784",
                lowScore: modelPrice - 100000,
                highScore: modelPrice + 200000
            },
            {
                title: "High Price",
                advice: "Above market average",
                color: "#4FC3F7",
                lowScore: modelPrice + 200000,
                highScore: modelPrice + 500000
            }
        ]
    };

    function lookUpGrade(lookupScore, grades) {
        for (var i = 0; i < grades.length; i++) {
            if (
                grades[i].lowScore <= lookupScore &&
                grades[i].highScore >= lookupScore
            ) {
                return grades[i];
            }
        }
        return null;
    }

    function formatValueWithLakh(value) {
        const formattedValue = (value / 100000).toFixed(2);
        return `${formattedValue}L`;
    }

    var chart = am4core.create("chartdiv", am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0;
    chart.fontSize = 11;
    chart.innerRadius = am4core.percent(82);
    chart.resizable = true;

    function updateModelOutput(modelOutput) {
        data.score = modelOutput;
        animateNeedle(data.score);
    }

    function animateNeedle(value) {
        var animation = hand.animate(
            { property: "value", to: value },
            1000,
            am4core.ease.cubicOut
        );
        animation.events.on("animationended", function() {
            var matchingGrade = lookUpGrade(value, data.gradingData);
            labelMetricValue.text = "\u20B9" + formatValueWithLakh(value);
            labelMetricValue.fill = am4core.color(matchingGrade.color);
        });
    }

    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = chartMin;
    axis.max = chartMax;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 0;
    axis.renderer.ticks.template.disabled = false;
    axis.renderer.ticks.template.strokeOpacity = 0;
    axis.renderer.ticks.template.strokeWidth = 0.5;
    axis.renderer.ticks.template.length = 1;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.radius = am4core.percent(15);
    axis.renderer.labels.template.fontSize = "0.8em";
    axis.renderer.labels.template.fill = am4core.color("#000000"); //hyo ahe gauge chya label cha code 

    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = chartMin;
    axis2.max = chartMax;
    axis2.renderer.radius = am4core.percent(105);
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = false;
    axis2.renderer.grid.template.opacity = 0;
    axis2.renderer.labels.template.bent = true;
    axis2.renderer.labels.template.fill = am4core.color("#990033");
    axis2.renderer.labels.template.fontWeight = "bold";
    axis2.renderer.labels.template.fillOpacity = 0;
    axis2.numberFormatter.numberFormat = "'\u20B9'#,#,0000L";


    for (let grading of data.gradingData) {
        var range = axis2.axisRanges.create();
        range.axisFill.fill = am4core.color(grading.color);
        range.axisFill.fillOpacity = 1;
        range.axisFill.zIndex = -1;
        range.value = grading.lowScore;
        range.endValue = grading.highScore;
        range.grid.strokeOpacity = 0;
        range.stroke = am4core.color(grading.color).lighten(-0.1);
        range.label.inside = true;
        range.label.text = grading.title.toUpperCase();
        range.label.inside = true;
        range.label.location = 0.5;
        range.label.inside = true;
        range.label.radius = am4core.percent(10);
        range.label.paddingBottom = -5;
        range.label.fontSize = "0.9em";
    }

    var matchingGrade = lookUpGrade(data.score, data.gradingData);

    var labelMetricValue = chart.radarContainer.createChild(am4core.Label);
    labelMetricValue.isMeasured = false;
    labelMetricValue.fontSize = "4em";
    labelMetricValue.x = am4core.percent(50);
    labelMetricValue.paddingBottom = -5;
    labelMetricValue.horizontalCenter = "middle";
    labelMetricValue.verticalCenter = "bottom";
    labelMetricValue.text = "\u20B9" + formatValueWithLakh(data.score);
    labelMetricValue.fill = am4core.color(matchingGrade.color);

    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.radius = am4core.percent(85);
    hand.innerRadius = am4core.percent(50);
    hand.startWidth = 10;
    hand.pixelHeight = 10;
    hand.pin.disabled = true;
    hand.value = data.score;
    hand.fill = am4core.color("#e6005c"); // needle cha code 
    hand.stroke = am4core.color("#000");

    var handTarget = chart.hands.push(new am4charts.ClockHand());
    handTarget.axis = axis2;
    handTarget.radius = am4core.percent(100);
    handTarget.innerRadius = am4core.percent(105);
    handTarget.fill = axis2.renderer.line.stroke;
    handTarget.stroke = axis2.renderer.line.stroke;
    handTarget.pin.disabled = true;
    handTarget.pin.radius = 12;
    handTarget.startWidth = 10;
    handTarget.fill = am4core.color("#990033");  // starting cha je ahe te pin point 
    handTarget.stroke = am4core.color("#990033");

    hand.events.on("propertychanged", function(ev) {
        var value = axis2.positionToValue(hand.currentPosition);
        labelMetricValue.text = "\u20B9" + formatValueWithLakh(value);
        labelMetricValue.fill = am4core.color(matchingGrade.color);
    });

    hand.events.on("positionchanged", function(){
        var value = axis2.positionToValue(hand.currentPosition);
        labelMetricValue.text = "\u20B9" + formatValueWithLakh(value);
        labelMetricValue.fill = am4core.color(matchingGrade.color);
    });


    updateModelOutput(modelPrice);
}

gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#main"),
  smooth: true
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("#main", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});




// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();



const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach((item) => {
    const question = item.querySelector('.question');
    const answer = item.querySelector('.answer');

    question.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});






