// list of photographers and categories
const getDropdown = async () => {
    const photographers = await (await fetch(config.api_url + '/images/photographers')).json();
    const photographerdropdown = document.getElementById('photographer');
    // in the future, we probably want to make the api sort alphabetically instead of doing it here
    photographers.sort().forEach((element) => {
        const option = document.createElement('option');
        option.text = element;
        photographerdropdown.add(option);
    });

    const categories = await (await fetch(config.api_url + '/images/categories')).json();
    const categorydropdown = document.getElementById('category');
    categories.forEach((element) => {
        const option = document.createElement('option');
        option.text = element.charAt(0).toUpperCase() + element.slice(1);
        categorydropdown.add(option);
    });
};

getDropdown();

// has the user selected this option
photographer.onchange = (e) => {
    if (e.target.value === 'Other') {
        newphotographer.style.display = 'block';
    } else {
        newphotographer.style.display = 'none'; 
    }
}

category.onchange = (e) => {
    if (e.target.value === 'Other') {
        newcategory.style.display = 'block';
    } else {
        newcategory.style.display = 'none'; 
    }
}
