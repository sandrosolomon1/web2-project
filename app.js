const LocalStorageCtrl = (function() {
    return {
        StoreItem : (item) => {
            if(!(localStorage.getItem('item-list'))) {
                let arr = [item];
                localStorage.setItem('item-list', JSON.stringify(arr));
            }else{
                let larr = JSON.parse(localStorage.getItem('item-list'));
                larr.push(item);
                localStorage.setItem('item-list',JSON.stringify(larr));
            }
        },
        updateStorage : (arr) => {
            localStorage.setItem('item-list',JSON.stringify(arr));
        },
        getLocalStorageItemListData : () => {
            return JSON.parse(localStorage.getItem('item-list'));
        },
        ClearItemList : () => {
            localStorage.removeItem('item-list');
        }
    };
})();

const ItemCtrl = (function(){

    const item = function(id,name,calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    const data = {
        items : [
            //{id : 0, name : 'alah', calories : 19}    
        ],
        currentItem : null,
        totalcalories : 0,
        id : 0
    }

    return {
        logData : () => data,
        currid : () => {
            data.id++;
            return data.id;
        },
        getitems : () => data.items,
        createitem : (id,name,calories) => new item(id,name,calories),
        insertitem : item => {
            // @update Database
            data.items.push(item);
            console.log(item);
            // @Add to LocalStorage
            LocalStorageCtrl.StoreItem(item);
        },
        updatetotalcalories : () => {
            let total = 0;
            data.items.forEach(el => {
                total += Number(el.calories);
            });

            data.totalcalories = total;
            console.log(data.totalcalories);
        },
        gettotalcalories : () => data.totalcalories,
        addtototalcalories : (item) => {
            data.totalcalories += Number(item.calories);
        },
        updateItems : (arr) => {
            data.items = arr;

            // @update LocalStorage
            LocalStorageCtrl.updateStorage(arr);
        },
        setcurrentItem : item => {data.currentItem = item},
        getcurrentItem : () => data.currentItem,
        clearAllitems : () => {
            data.items = [];
            data.totalcalories = 0;
            data.currentItem = null;
            data.id = 0;

            // @Clear LocaStorage List items data
            LocalStorageCtrl.ClearItemList();
        }
    }

})();

const UICtrl = (function() {
    const UIselectors = {
        itemlist : '#item-list',
        add_btn : '#add-meal',
        update_btn : '#update-btn',
        delete_btn : '#delete-btn',
        back_btn : '#back-btn',
        clear_btn : '#clear-btn',
        item_name : '#item-name',
        item_calories : '#item-calories',
        total_calories : '.total-calories'
    }

    const UIstate = function() {
        let currentstate = new addmealState(this);

        this.change = function(state) {
            currentstate = state;
        }

        this.init = function() {
            currentstate.call();
        }
    }

    //states
    const addmealState = function(obj) {
        this.call = function() {
            document.querySelector(UIselectors.update_btn).style.display = 'none';
            document.querySelector(UIselectors.delete_btn).style.display = 'none';
            document.querySelector(UIselectors.back_btn).style.display = 'none';

            document.querySelector(UIselectors.add_btn).style.display = 'inline';
        }
    }

    const updatemealState = function(obj) {
        this.call = function() {
            document.querySelector(UIselectors.update_btn).style.display = 'inline';
            document.querySelector(UIselectors.delete_btn).style.display = 'inline';
            document.querySelector(UIselectors.back_btn).style.display = 'inline';

            document.querySelector(UIselectors.add_btn).style.display = 'none';
        }
    }

    return {
        draw_items : (items) => {
            let html = '';
            items.forEach(item => {
                html += `
                    <li class="collection-item" id="item-${item.id}">
                        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                        <a href="#" class="secondary-content">
                        <i class="fa fa-pencil"></i>
                        </a>
                    </li>
                `
            });
            document.querySelector(UIselectors.itemlist).innerHTML = html;
        },
        clearItemList : () => {
            document.querySelector(UIselectors.itemlist).innerHTML = '';
            //zero totalcalories count
            document.querySelector(UIselectors.total_calories).textContent = 0;
        },
        clearInput : () => {
            document.querySelector(UIselectors.item_name).value = '';
            document.querySelector(UIselectors.item_calories).value = '';
        },
        changestate : (option) => {
            const pagestate = new UIstate;

            if(option == 'addmeal') {
                pagestate.change(new addmealState);
            } else if(option == 'updatemeal'){
                pagestate.change(new updatemealState);
            }
            pagestate.init();
        },
        stateinitdefault : () => {
            pagestate.change(new addmealState);
            pagestate.init();
        },
        sumtotalcalories : (calories) => {
            totalcals = document.querySelector(UIselectors.total_calories);
            totalcals.textContent = calories;
        }, 
        getselectors : () => UIselectors
    }
})();

const app = (function(ItemCtrl,UICtrl){
    const UIselectors = UICtrl.getselectors();

    const loadeventlisteners = function() {
        // Disable enter keyboard press
        document.addEventListener('keypress', e => {
            if(e.keycode === 13 || e.which === 13) {
                e.preventDefault();
                return 0;
            }
        })

        document.querySelector(UIselectors.clear_btn).addEventListener('click', e => clearAll(e));
        document.querySelector(UIselectors.add_btn).addEventListener('click', e => additemtolist(e));
        document.querySelector(UIselectors.itemlist).addEventListener('click', e => calleditmenu(e));
        document.querySelector(UIselectors.back_btn).addEventListener('click', e => calldefaultmenu(e));
        document.querySelector(UIselectors.update_btn).addEventListener('click', e => editupdatesubmit(e));
        document.querySelector(UIselectors.delete_btn).addEventListener('click', e => deleteitem(e));
    }

    const loadLocalStorageData = function() {
        const data = LocalStorageCtrl.getLocalStorageItemListData();

        if(data) {
            // @Copy data to database from locastorage
            ItemCtrl.updateItems(data);
            // @update totalcalories
            ItemCtrl.updatetotalcalories();
        }
    }

    const clearAll = function(e) {
        ItemCtrl.clearAllitems();
        UICtrl.clearItemList();
    }

    const additemtolist = function(e) {
        // Input values
        const meal = document.querySelector(UIselectors.item_name).value,
              calories = document.querySelector(UIselectors.item_calories).value;

        if(meal != '' && calories != ''){
            let id = ItemCtrl.currid();

            // Create an item and insert to the Database
            const item = ItemCtrl.createitem(id,meal,calories);
            ItemCtrl.insertitem(item);
            ItemCtrl.addtototalcalories(item);

            //Update UI
            UICtrl.draw_items(ItemCtrl.getitems());
            UICtrl.sumtotalcalories(ItemCtrl.gettotalcalories());
        }
        //console.log(ItemCtrl.logData())
        e.preventDefault();
    }

    const calleditmenu = function(e) {
        if(e.target.classList.contains('fa-pencil')){
            //changing state
            UICtrl.changestate('updatemeal');

            //set currentItem which ll be modified
            let arr = [];
            Array.from(e.target.parentElement.parentElement.children).forEach(e => {
                let a = e.textContent.split(':');
                a = a[0].split(' ');
                arr.push(a);
            });

            let items = ItemCtrl.getitems();

            items.forEach(e => {
                if(arr[0][0] === e.name) {
                    ItemCtrl.setcurrentItem(e);
                }
            })

            //set input values to current item values
            document.querySelector(UIselectors.item_name).value = arr[0][0];
            document.querySelector(UIselectors.item_calories).value = arr[1][0];
            //developing only
            console.log(ItemCtrl.logData());
        };
    }

    const calldefaultmenu = function(e) {
        UICtrl.changestate('addmeal');
        UICtrl.clearInput();

        e.preventDefault();
    }

    const editupdatesubmit = function(e) {
        const items = ItemCtrl.getitems(),
              curritem = ItemCtrl.getcurrentItem(),
              newmeal = document.querySelector(UIselectors.item_name).value,
              newcalories = document.querySelector(UIselectors.item_calories).value;

        curritem.name = newmeal;
        curritem.calories = newcalories;

        //create updated items list
        let arr = [];
        items.forEach(e => {
            if(e.id === curritem.id) {
                arr.push(curritem);
            }else{
                arr.push(e);
            }
        });

        // @update database
        ItemCtrl.updateItems(arr);
        // @update total calories count
        ItemCtrl.updatetotalcalories();
        // @update UI calories count
        UICtrl.sumtotalcalories(ItemCtrl.gettotalcalories());
        // @redraw item list
        UICtrl.draw_items(ItemCtrl.getitems());
        
        e.preventDefault();
    }

    const deleteitem = function(e) {
        const curritem = ItemCtrl.getcurrentItem();
        let items = Array.from(ItemCtrl.getitems());
        
        for(let i=0;i<items.length;i++){
            if(items[i].id === curritem.id){
                items.splice(i,1);
                console.log('spliced');
            }
        }
        
        // @update database
        ItemCtrl.updateItems(items);
        // @clear input
        UICtrl.clearInput();
        // @change state to default
        UICtrl.changestate('addmeal');
        // @update total calories count
        ItemCtrl.updatetotalcalories();
        // @update UI calories count
        UICtrl.sumtotalcalories(ItemCtrl.gettotalcalories());
        // @redraw item list
        UICtrl.draw_items(ItemCtrl.getitems());

        e.preventDefault();
    }

    return {
        init : () => {
            loadLocalStorageData();
            loadeventlisteners();
            
            if(ItemCtrl.getitems().lenght != 0) {
                UICtrl.draw_items(ItemCtrl.getitems());
                UICtrl.sumtotalcalories(ItemCtrl.gettotalcalories());
            }

        }
    }
})(ItemCtrl,UICtrl);


//main init..
app.init();