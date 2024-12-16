const API_URL = "https://dummyjson.com/carts";

async function loadCartData(){
    try {
        const response = await fetch(API_URL);
        if(response.ok){
            const cart = await response.json();
            loadToTable(cart['carts']);
        }    
    } catch (error) {
        console.error("Error "+error);
    }  
}

function loadToTable(data){
    const tableBody = document.querySelector('#cart-table tbody');
    tableBody.innerHTML='';
    
    data.forEach(rows => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rows.id}</td>
            <td>${rows.total}</td>
            <td>${rows.userId}</td>
            <td>${rows.totalProducts}</td>
            <td>${rows.totalQuantity}</td>
        `;
        tableBody.appendChild(row);
    });
}

window.addEventListener('load',loadCartData());