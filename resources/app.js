button1 = document.getElementById("one_button");
button2 = document.getElementById("two_button");
image = document.getElementById("image")

textName = document.getElementById("h2_text")
text = document.getElementById("h4_text")

let i = 0;

allTextName = ['3Д Моделирование', 'Психология'];
allImage = ['./resources/images/site2.png', "./resources/images/site1.png"]



let Change2 = function() {
    image.src = allImage[i];
    textName.innerText = allTextName[i]
    text.innerText = "Мне 20 лет, обучаюсь в МГТУ имени Никола Эрнестовича Баумана, по образованию инженер. Помимо профильного образования обучаюсь на Frontend-Developer курсе платформы Codecademy. Имею неплохой опыт в создании лендингов для различных проектов: портфолио, сайт личного"
    if (i >= 1 || i < 0) {
        i = 0;
    } else {
        i++
    }
}

let Change1 = function() {

    image.src = allImage[i];
    textName.innerText = allTextName[i]
    text.innerText = "Мне 20 лет, обучаюсь в МГТУ имени Никола Эрнестовича Баумана, по образованию инженер. Помимо профильного образования обучаюсь на Frontend-Developer курсе платформы Codecademy. Имею неплохой опыт в создании лендингов для различных проектов: портфолио, сайт личного"
    if (i >= 1 || i < 0) {
        i = 0;
    } else {
        i--
    }
}


button1.onclick = Change1;
button2.onclick = Change2;