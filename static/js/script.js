// Initialize the questions and add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const numCircles = 5;  // Number of circles per question
    const questions = ['q1', 'q2', 'q3'];

    const splashScreen = document.getElementById('splash-screen');
    const container = document.querySelector('.container');
    const quote_scene = document.getElementById('quote-scene');
    const questions_scene = document.getElementById('questions-scene');

    // Function to check if all questions are answered and add red border if not
    function checkAnswers() {
        let allAnswered = true;
        questions.forEach(questionId => {
            const questionCircles = document.querySelectorAll(`#${questionId} .circle`);
            const selectedCircle = document.querySelector(`#${questionId} .selected`);

            if (!selectedCircle) {
                allAnswered = false;  // Mark as unanswered
                questionCircles.forEach(circle => circle.classList.add('unanswered'));
            } else {
                questionCircles.forEach(circle => circle.classList.remove('unanswered'));
            }
        });
        return allAnswered;
    }

    function load_scene(scene) {

        // initialise container opcity zero

        container.style.transition = "";
        
        scene.style.opacity = 0;
        scene.style.display = "";

        // Wait for the fade-out duration before hiding the splash screen and showing the container
        splashScreen.style.opacity = '0';

        
        scene.style.opacity = 1; // show container
        container.style.opacity = 1;
    }

    function unload_scene(scene) {

        // initialise container opacity zero
        container.style.opacity = 0;
        container.style.transition = '0s';


        scene.style.opacity = 0;
        scene.style.display = "none";

        splashScreen.style.display = "";
        splashScreen.style.opacity = 1;
        // Wait for the fade-out duration before hiding the splash screen and showing the container
    }

    function intro() {
        splashScreen.style.display = 'flex';
        splashScreen.style.opacity = 1;
        container.style.opacity = 0;
        container.style.transition = 'opacity 1s ease';

        setTimeout(function() {
            //code
            container.style.display = '';
            container.style.opacity = 1;
            splashScreen.style.opacity = 0;

            setTimeout(function() {
                //code
                splashScreen.style.display = 'none';
            
            }, 1000);
        
        }, 1000);
        
    } // function DONE

    intro();

    // Create circles for each question
    questions.forEach(questionId => {
        const container = document.getElementById(questionId);
        for (let i = 1; i <= numCircles; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circle.dataset.value = i;  // Set data-value for each circle
            container.appendChild(circle);

            // Circle click event to select and remove red border
            circle.addEventListener('click', function() {
                // Deselect all circles in this question
                const allCircles = container.querySelectorAll('.circle');
                allCircles.forEach(c => c.classList.remove('selected', 'unanswered'));

                // Select the clicked circle
                circle.classList.add('selected');
            });
        }
    });

    // Handle form submission
    document.getElementById('submit-btn').addEventListener('click', function () {


        if (!checkAnswers()) {
            alert("Please answer all questions before submitting.");
            return;  // Prevent submission if any question is unanswered
        }

        unload_scene(questions_scene);


        const responses = questions.map(questionId => {
            const selectedCircle = document.querySelector(`#${questionId} .selected`);
            return selectedCircle ? Number(selectedCircle.dataset.value) : 0; // Get the value of the selected circle
        });

        // Send data to the server (back end)
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ responses: responses }),
        })
        .then(response => response.json())
        .then(data => {
            // Hide the question scene and show the quote scene
            //document.getElementById('questions-scene').style.display = 'none';
            //document.getElementById('quote-scene').style.display = 'block';
            
            
            
            // Display the quote and author
            load_scene(quote_scene);
            document.getElementById('quote').textContent = `"${data.quote}"`;
            document.getElementById('author').textContent = `- by ${data.author}`;
        });
    });

    // New quote button functionality
    document.getElementById('new-quote-btn').addEventListener('click', function () {
        // Re-fetch a new quote (dummy values for trigger)
        unload_scene(quote_scene);
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ responses: [7, 7, 7, 7, 7] }) // Dummy values to trigger a request
        })
        .then(response => response.json())
        .then(data => {
            load_scene(quote_scene);
            document.getElementById('quote').textContent = `"${data.quote}"`;
            document.getElementById('author').textContent = `- by ${data.author}`;
        });
    });
});
