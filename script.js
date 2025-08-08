const menuItems = [
    { name: "Burger", price: 120, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBFCimCM1wFvb3FZQOZH_j5ta4Qd2SlNj2vg&s" },
    { name: "Pizza", price: 200, img: "https://pixelz.cc/wp-content/uploads/2018/10/pizza-uhd-4k-wallpaper.jpg" },
    { name: "Pasta", price: 150, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtGxJQNLQ_tpfDqgGfFpEARarc7qNGTDVEYg&s" },
    { name: "Hot Dog", price: 100, img: "https://www.licious.in/blog/wp-content/uploads/2016/07/Hot-Dogs.jpg" },
    { name: "Donuts", price: 80, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj4Lk2zhaHaNowDxe_KI6BnBih0HyikzNBwg&s" },
    { name: "French Fries", price: 90, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWSHmu4IQuqyUM4BJi7QyDXcf6-7cTaaVsvg&s" },
    { name: "Sandwich", price: 110, img: "https://recipes.net/wp-content/uploads/2023/07/grilled-panini-sandwich-without-a-panini-maker_7b3097036d606d991d849410f39996d7.jpeg" },
    { name: "Tacos", price: 130, img: "https://www.onceuponachef.com/images/2011/02/chicken-tacos-11.jpg" },
    { name: "Noodles", price: 140, img: "https://thechutneylife.com/wp-content/uploads/2017/09/hakka2.jpeg" },
    { name: "Thumbs up", price: 50, img: "https://dukaan.b-cdn.net/700x700/webp/572579/8d1b9e6c-727f-4224-a98c-638f0638db89.png" },
    { name: "Sprite", price: 50, img: "https://t3.ftcdn.net/jpg/02/86/26/86/360_F_286268644_FJxZ9RW8bXWWiaZgKajwnwEZ61ynkfOp.jpg" },
    { name: "Coke Cola", price: 50, img: "https://m.media-amazon.com/images/I/61SISUGCDYL.jpg" }
];

const menuContainer = document.getElementById("menu");
const orderList = document.getElementById("order-list");
const totalDisplay = document.getElementById("total");
let cart = [];

function renderMenu() {
    menuItems.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <button onclick="addToOrder(${index})">Add to Order</button>
        `;
        menuContainer.appendChild(card);
    });
}

function addToOrder(index) {
    cart.push(menuItems[index]);
    updateOrder();
}

function removeFromOrder(i) {
    cart.splice(i, 1);
    updateOrder();
}

function updateOrder() {
    orderList.innerHTML = "";
    let total = 0;
    cart.forEach((item, i) => {
        total += item.price;
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ₹${item.price} <button class="remove-btn" onclick="removeFromOrder(${i})">X</button>`;
        orderList.appendChild(li);
    });
    totalDisplay.innerText = `Total: ₹${total}`;
}

document.getElementById("place-order").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    const name = prompt("Enter your name for the order:");
    if (!name) return;
    const payment = prompt("Enter payment method (Cash, Card, UPI):");
    alert(`Thank you, ${name}! Your order of ₹${cart.reduce((a,b)=>a+b.price,0)} has been placed.
Payment Method: ${payment}`);
    cart = [];
    updateOrder();
});

renderMenu();
