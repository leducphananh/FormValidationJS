// Đối tượng
function Validator(object){
    
    function getParent(element, selectorParent){
        while(element.parentElement){
            if(element.parentElement.matches(selectorParent)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    // Object, mỗi attribute có key là selector và value là 1 array các rule
    // Lưu tất cả rules của từng selector
    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule, errorElement){
        var errorMessage
        
        // lấy ra các rules của selector
        var thisRules = selectorRules[rule.selector]

        // lặp qua từng rule và kiểm tra
        for(var i = 0; i < thisRules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = thisRules[i].test(
                        formElement.querySelector(thisRules[i].selector + ':checked')
                    ) 
                    break
                default:
                    errorMessage = thisRules[i].test(inputElement.value)    
            }
            if(errorMessage) break
        }

        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement, object.formGroupSelector).classList.add('invalid')
        }else{
            errorElement.innerText = ''
            getParent(inputElement, object.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    // lấy element form được chọn
    var formElement = document.querySelector(object.form)

    if(formElement){

        // ấn nút submit
        formElement.onsubmit = function(e){
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rule và validate
            object.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var errorElement = getParent(inputElement, object.formGroupSelector).querySelector(object.errorSelector)
                var isValid = validate(inputElement, rule, errorElement)
                if(!isValid){
                    isFormValid = false
                }
            })

            if(isFormValid){
                // Submit với JS
                if(typeof object.onSubmit === 'function'){
                    // trong nhiều trường hợp, có một số thẻ sẽ có attibute disabled(người dùng không thể tương tác vào được)
                    // select tất cả thẻ có attibute name và không có attibute disabled
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                if(input.matches(':checked')){
                                    values[input.name] = input.value
                                }
                                break
                            case 'checkbox':
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                if(input.matches(':checked')){
                                    values[input.name].push(input.value)
                                }
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    object.onSubmit(formValues)
                }
                // Submit với hành vi mặc định
                else{
                    formElement.submit()
                }
            }
        }

        // lặp qua từng rule
        object.rules.forEach(function(rule){

            // thêm rule cho mỗi input, nếu đã có thì thêm vào mảng rule, 
            // còn chưa thì gán cho một array có 1 phần tử là rule đó
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule)
            }else{
                selectorRules[rule.selector] = [rule]
            }

            // lấy element của rule
            var inputElements = formElement.querySelectorAll(rule.selector)
            
            Array.from(inputElements).forEach(function(inputElement){

                // lấy element form-message (hiển thị lỗi)
                var errorElement = getParent(inputElement, object.formGroupSelector)
                                    .querySelector(object.errorSelector)

                if(inputElement){
                    // khi blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement, rule, errorElement)  
                    }

                    // khi bắt đầu nhập vào input
                    inputElement.oninput = function(){
                        errorElement.innerText = ''
                        getParent(inputElement, object.formGroupSelector).classList.remove('invalid')
                    }
                }          
            })
        })
    }
}

// Hàm 
// 1. Nếu lỗi => message lỗi
// 2. Nếu hợp lệ => không trả lại (undefined)
Validator.isRequire = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return regex.test(value.trim()) ? undefined : message || 'Nhập đúng email!'
        }
    }
}

Validator.minLength = function(selector, minLength, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= minLength ? undefined : message || `Vui lòng nhập tối thiểu ${minLength} kí tự!`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}