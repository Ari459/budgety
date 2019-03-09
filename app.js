// BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value; 
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round(this.value / totalIncome * 100);
        }else{
            this.percentage = -1;
        }
    };


    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value; 
    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget : 0,
        percentage: -1,
    };

    // private function
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        data.totals[type] = sum;

        
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //Create new ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length  - 1].id + 1;
            }else{
                ID=0;
            }

            // Create new item based on 'inc' or 'exp' type
            if(type==='exp'){
                newItem = new Expense(ID, des, val);
            }else if(type==='inc'){
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteIem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            // calculate total income ans expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expsense
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
             
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            }); 
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            } 
        },
        testing: function(){
            console.log(data);
        }
    };
    
})();

// UI CONTROLLER
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel: '.budget__income--value',
        expsensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }; 


    return {
        getInput: function (){
            return {
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value),
                type : document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value
            };
        },

        addListItem: function(obj, type){
            // create html string with placeholder text
            var html, newHtml, element;
            if(type==='inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type ==='exp'){
                element = DOMStrings.expensesContainer;
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // replace placeholder text with actual data
            newHtml = html.replace ('%id', obj.id);
            newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%description%', obj.description);

            // insert html into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID,){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            // querySelectorAll returns a List. convert List to Array
            var fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current .value = "";
                current.description = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expsensesLabel).textContent = obj.totalExp;
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){

        },
        getDOMString: function(){
            return DOMStrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListerners = function (){
        var DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){ // event can be any name. Automatically passed by browser
            
            if(event.keyCode===13 || event.which ===13 ){ // which is for older browsers
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);



    };


    var updateBudget = function (){
        
        // 1 calculate the budget
        budgetController.calculateBudget();

        // 2 return the budget
        var budget = budgetController.getBudget();
        
        // 3 display the budget on the UI

        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function(){

        // 1 calculate the %
        budgetCtrl.calculatePercentages();

        // 2 read % from the budget contoller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);

        // 3 update the UI with new %
    }

    var ctrlAddItem = function(){
        var input, newItems;
         // TODO
       // 1 get the field input data
        input = UICtrl.getInput();
     
        if(input.description!=="" && !isNaN(input.value) && input.value > 0){

            // 2 Add the itme to the budget controller
             newItem = budgetCtrl.addItem(input.type, input.description, input.value);
             
             // 3 add the item to the UI
             UICtrl.addListItem(newItem, input.type);
             
             // 4. clear input fields
             UICtrl.clearFields();
     
             // 5 calculate and update the budget
             updateBudget();
     
             // 6 
             updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1 delete the item from DS
            budgetCtrl.deleteIem(type, ID);

            // 2 delete the item from UI
            UICtrl.deleteListItem(itemId);

            //3 update and show the new budget
            updateBudget();
        }
    }

    return {
        init: function(){
            console.log('Application has started');
            
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListerners();
        }
    }
    
    

})(budgetController,UIController);

// Global app invoke
controller.init();