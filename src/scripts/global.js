var db = {
    reqType: "",
    reqData: "",
    data: "",
    successFunc: "",
    errFunc: "",
    ajaxReqUrl: "http://10.150.222.28:2020/api/",
    login: function(data, successFunc, errFunc) {
        db.setGlobalData('login', 'POST', data, successFunc, errFunc);
        db.ajax();
    },
    logout: function(successFunc, errFunc) { //logout functionality
        var data = {};
        data.id = parseInt(localStorage.getItem('id'));
        data.sessionId = "";
        db.setGlobalData('logout', 'POST', data, successFunc, errFunc);
        db.ajax();
    },

    uploadImage: function(id, imageData, table, successFunc, errFunc) { //to upload images via modal

        // console.log(imageData.type.split('/')[1])
        // var file_data = $("#editprofile").prop("files")[0];   // Getting the properties of file from file field
        var form_data = new FormData(); // Creating object of FormData class
        form_data.append('image', imageData);
        form_data.append('id', id);
        form_data.append('table', table); // Appending parameter named file with properties of file_field to form_data
        // form_data.append("user_id", 123)                 // Adding extra parameters to form_data
        $.ajax({
            url: "http://10.150.222.28:2020/api/uploadImage",
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            success: successFunc,
            error: errFunc, // Setting the data attribute of ajax with file_data
            type: 'POST'
        })


    },
    accessData: function(requestData, table, data, successFunc, errFunc) { //global function to access data  from database throughout the app
        db.successFunc = successFunc;
        db.errFunc = errFunc;
        db.reqData = requestData;

        var errorMsg = "";
        if (table === "supervisor" || table === "supervisee" || table === "admin" || table === "login") {
            data.table = table;
            data.userId = parseInt(localStorage.getItem('id'));
            data.sessionId = localStorage.getItem('session_id');
            db.data = data;

        } else {
            errorMsg += "Invalid table requested.\nAccepted Types: \n1.supervisor \n2.supervisee\n3.admin";
        }

        if (requestData === "deleteData") {
            db.reqType = "DELETE";
        } else if (requestData === "updateData") {
            db.reqType = "PUT";
        } else if (requestData === "getData" || requestData === "getDataByAttribute" || requestData === "addData" || requestData === "getDataById") {
            db.reqType = "POST";
        } else {
            errorMsg += "\nInvalid requestType.\nAccepted Types:\n1.deleteData \n2.updateData \n3.getData\n4.getDataByAttribute\n5.addData\n\n";
        }


        try {
            JSON.parse(JSON.stringify(data));
            // if((requestData != "getData")||(data.id==null||data.id==""))
            //     errorMsg+="Missing id attribute";
        } catch (e) {
            errorMsg += 'Please provide valid JSON data::=> ' + e.message;
        }



        if (errorMsg != "") {
            return errFunc(errorMsg);
        }

        db.ajax();

    },
    ajax: function() { //Global function for Ajax call

        $.ajax({
            type: db.reqType,
            contentType: "application/json",
            url: db.ajaxReqUrl + db.reqData,
            data: JSON.stringify(db.data),
            success: db.successFunc,
            error: db.errFunc

        });
    },
    setLocalStorage: function(keyValue, cvalue) {
        localStorage.setItem(keyValue, cvalue);
    },
    removeLocalStorage: function(value) {
        localStorage.removeItem(value);
    },

    forgotPass: function(data, successFunc, errFunc) { //Global function accessing username to use for Forgot Password functionality
        db.setGlobalData('forgotPass', 'POST', data, successFunc, errFunc);
        db.ajax();
    },
    assignSupervisees: function(data, successFunc, errFunc) { //Function to assign supervisees
        db.setGlobalData('assignSupervisees', 'POST', data, successFunc, errFunc);
        db.ajax();
    },
    setGlobalData: function(reqData, reqType, data, successFunc, errFunc) { //Function to set Global Data
        db.reqData = reqData;
        db.reqType = reqType;
        db.data = data;
        db.successFunc = successFunc;
        db.errFunc = errFunc;
    }
}