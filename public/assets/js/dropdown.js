const getDropdownItems = (element) => { 
    let array = new Array();
    for (i = 0; i < element.options.length; i++) {
       array[i] = element.options[i].value;
    }
    return array;  
}

// list of photographers and categories
let photographerselected, categoryselected;
const getDropdown = async () => {
    const photographerdropdown = document.getElementById('photographer');
    const categorydropdown = document.getElementById('category');

    photographerselected = photographerdropdown.value;
    categoryselected = categorydropdown.value;

    // clear existing data
    photographerdropdown.length = 0;
    categorydropdown.length = 0;

    // add loading text
    const photographerloading = document.createElement('option');
    photographerloading.text = 'Loading...';
    photographerdropdown.add(photographerloading);

    const categoryloading = document.createElement('option');
    categoryloading.text = 'Loading...';
    categorydropdown.add(categoryloading);

    // this is for adding new photographers or categories
    const other = document.createElement('option');
    other.text = 'Other';

    const other2 = document.createElement('option');
    other2.text = 'Other';

    const photographers = await (await fetch(config.api_url + '/images/photographers')).json();
    // in the future, we probably want to make the api sort alphabetically instead of doing it here
    photographers.sort().forEach((element) => {
        const option = document.createElement('option');
        option.text = element;
        photographerdropdown.add(option);
    });

    photographerdropdown.remove(photographerloading);
    photographerdropdown.add(other2);

    const categories = await (await fetch(config.api_url + '/images/categories')).json();
    categories.forEach((element) => {
        const option = document.createElement('option');
        option.text = element.charAt(0).toUpperCase() + element.slice(1);
        categorydropdown.add(option);
    });

    categorydropdown.remove(categoryloading);
    categorydropdown.add(other);

    // make sure the user doesn't select something that no longer exists
    if (getDropdownItems(photographerdropdown).includes(photographerselected)) {
        photographerdropdown.value = photographerselected;
    } else {
        newphotographerdiv.style.display = 'none';
    }

    if (getDropdownItems(categorydropdown).includes(categoryselected)) {
        categorydropdown.value = categoryselected;
    } else {
        newcategorydiv.style.display = 'none';
    }
};

getDropdown();

// has the user selected this option
photographer.onchange = (e) => {
    if (e.target.value === 'Other') {
        newphotographerdiv.style.display = 'block';
    } else {
        newphotographerdiv.style.display = 'none'; 
    }
}

category.onchange = (e) => {
    if (e.target.value === 'Other') {
        newcategorydiv.style.display = 'block';
    } else {
        newcategorydiv.style.display = 'none'; 
    }
}
