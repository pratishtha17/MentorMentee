$(function() {
    var isNotValidationError = false; //flag to check if a validation error occured on client side
    var isFieldLeftEmpty = true; //flag to check if the field has been left empty
    var isLoginPageOrForgotPage = 0; //flag to check if the page is currently login or forgot
    var userName = $('#username');
    var passWord = $('#password');
    var newEmail = "";

    $("#login").keypress(function(e) { //attaching enter key to login button
        var key = e.which;
        if (key === 13) // the enter key code
        {
            $("#login-btn").click();
            return false;
        }
    });

    $("#forgot-password-form").keypress(function(e) { //attaching enter key to forgot password submit button
        var key = e.which;
        if (key === 13) // the enter key code
        {
            $("#forgot-btn").click();
            return false;
        }
    });

    var onPageLoad = function() { //once logged in login page should not open in new tabs until logged out
        if (localStorage.session_id != undefined) {
            window.location.assign("dashboard.html");
        }
    }
    var validate = function() { //client side validation
        if ($(this).val().length >= 6 && $(this).val().match(/^[A-Za-z]/)) {
            $(".username-error").removeClass("error-show");
            isNotValidationError = true;
        } else if ($(this).val() === "") {
            $(".username-error").removeClass("error-show");
        } else {
            $(".username-error").html("Username should match a specific format!").addClass("error-show");
            isNotValidationError = false;
        }
    }
    var serverValidationForgotPassword = function() {
        //setting the new password on the database
        var username = { data: { userName: $("#forgot-password-username").val(), } };

        db.forgotPass(username, function(data) {

            newEmail = data;
            console.log(newEmail);
            sendNewPassword(newEmail, $("#forgot-password-username").val());
            return true;
        }, function(error) {

        });

    }

    function switchToForgotPassword() { //called to switch from login page to forget password
        var forgotUserName = $("#forgot-password-username");
        event.preventDefault();
        isNotValidationError = false;
        $("title").html("Forgot Password");
        $("#login").addClass("display-none-class");
        $("#remember-me").addClass("display-none-class");
        $("#forgot-password-form").removeClass("display-none-class");
        $("#back-to-login").removeClass("display-none-class");
        forgotUserName.val("");
        forgotUserName.on("blur", validate);
        $(".username-error").removeClass("error-show");

        isLoginPageOrForgotPage = 1;
    }

    function switchToLogin() { //called to switch from forgot page to login password
        $("#login").removeClass("display-none-class");
        $("#remember-me").removeClass("display-none-class");
        $("#new-password-sent").addClass("display-none-class");
        $("#forgot-password-form").addClass("display-none-class");
        $("#back-to-login").addClass("display-none-class");
        $("title").html("Login");
        userName.val("");
        passWord.val("");
        checkRemeberedUser();
        rememberMe();
        $(".username-error").removeClass("error-show");

        isLoginPageOrForgotPage = 0;

    }

    function newPasswordGenerate() { //called to generate a new password
        var newPassword = "", //Declaring a new password
            length = 8, //Declaring the length of the password
            charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_-#$%"; //Declaring the character set used to generate the new password
        for (var i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor((Math.random() * charset.length))); //Randomly generating a new password using the defined character set
        }
        return newPassword;
    }

    function sendNewPassword(newEmail, userName) {
        //called to send the new passwored to the user
        $("#forgot-message").html(newEmail);
        $("#new-password-sent").removeClass("display-none-class").html('Password Sent To:' + newEmail);
        $("#forgot-password-form").addClass("display-none-class");
        var newPassword = newPasswordGenerate();
        emailjs.send("gmail", "new_password", { "email": newEmail, "new_password": newPassword });
        db.accessData("getDataByAttribute",  "login",   {  attribute:  {  "userName":  userName  }  },  function (response)  {  
            console.log(response);          
            var id = response[0].id;
            var sessionId = response[0].sessionId;
            var admin = response[0].admin;
            console.log(id, sessionId, admin);
            updatePassword(userName, newPassword, id, sessionId, admin);
        }, function(error) {
            console.error(error)
        });
    }

    function updatePassword(userName, newPassword, id, sessionId, admin) {
        db.accessData("updateData", "login", { data: { "userName": userName, "password": newPassword, "id": id, "sessionId": sessionId, "admin": admin } }, function(response) {
                console.log("succesfull")
            },
            function(error) {
                console.error(error)
            });
    }

    $("#new-password-sent").addClass("display-none-class");
    $("#back-to-login").addClass("display-none-class");
    if (isLoginPageOrForgotPage === 1) {
        switchToForgotPassword();
    } else {

        isLoginPageOrForgotPage = 0;
        $("#forgot-password-form").addClass("display-none-class");
    }
    $("#forgot-password").on("click", switchToForgotPassword);
    $("#back-to-login").on("click", switchToLogin);
    $("#forgot-btn").on("click", function(event) {
        if ($("#forgot-password-username").val() === "") {
            isFieldLeftEmpty = false;
        } else {
            isFieldLeftEmpty = true;
        }
        if (isNotValidationError && isFieldLeftEmpty) {

            event.preventDefault();
            serverValidationForgotPassword();
        } else if (!isNotValidationError && isFieldLeftEmpty) {
            event.preventDefault();
        }
    });
    var clientValidation = function() {
        userName.on("blur", validate);
    }
    var serverValidation = function() {
        var loginData = { attribute: { userName: userName.val(), password: passWord.val() } }; //initialising the attributes to be sent to the database
        db.login(loginData, function(data) { //sending data to database server
            if (data.flag === true) {
                db.setLocalStorage('id', data.id);
                db.setLocalStorage('session_id', data.sessionId);
                db.setLocalStorage('admin', data.admin);
                window.location.assign("dashboard.html");
                rememberMe();
            } else {
                db.removeLocalStorage('id');
                db.removeLocalStorage('session_id');
                db.removeLocalStorage('admin');
                $(".username-error").html("Username/Password is incorrect!").addClass("error-show");
            }
        });
    }
    var rememberMe = function() { //called if remember me is checked
        if ($('#remember').prop("checked") === false) {
            if (userName.val() === localStorage.getItem('username')) {
                localStorage.removeItem('username');
            }
        } else {
            localStorage.setItem('username', userName.val());
        }
    }
    var checkRemeberedUser = function() { // checks if remember me is checked or not
        if (typeof(Storage) != "undefined") {
            if (userName.val() === "" && localStorage.getItem('username')) {
                userName.val(localStorage.username);
                isNotValidationError = true;
                $('#remember').prop('checked', 'true');
            }
        }
    }
    $("#login-btn").on("click", function(event) {
        if (passWord.val() === "" || userName.val() === "") {
            isFieldLeftEmpty = false;
        } else {
            isFieldLeftEmpty = true;
        }
        if (isNotValidationError && isFieldLeftEmpty) {
            event.preventDefault();
            rememberMe();
            serverValidation();
        } else if (!isNotValidationError && isFieldLeftEmpty) {
            event.preventDefault();
        }
    });

    checkRemeberedUser();
    clientValidation();
    onPageLoad();

});