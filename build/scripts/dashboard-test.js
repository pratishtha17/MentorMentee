$(function() {
    var supervisorData;
    var totalPersons;
    var superviseeData;
    var prevTarget = null;
    newId = 200000;
    document.getElementById("file-input").addEventListener('change', function() {
        var imgName = document.getElementById("file-input").files[0].name;
        document.getElementById("user-img").setAttribute("src", "img/" + imgName);
        // $('#user-img').Jcrop();
    });
    var load = function() {
            console.log(localStorage.admin)
            if (localStorage.admin === "true") {
                var adminId = localStorage.id;
                renderProfile("admin", adminId);
                db.accessData("getData", "supervisor", {}, function(response) {
                        supervisorData = response;
                        totalPersons = response.length;
                        var sortedResponse = sorting(response)
                        populateSupervisor(sortedResponse);
                        pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));
                    },
                    function(error) {
                        console.error(error)
                    });
                $("#supervisee-paginate-btn").hide();
            } else if (localStorage.admin === "false") {

                var supervisorId = localStorage.id;
                renderProfile("supervisor", supervisorId);
                $(".supervisor-division").addClass("hidden");
                $(".supervisee-division").removeClass("col-lg-6");
                $(".supervisee-division").addClass("col-lg-12");
                $(".supervisor-heading").hide();
                $(".supervisee-heading").addClass("supervisee-list-heading");

                db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {

                        var sortedResponse = sorting(response)
                        populateSupervisee(sortedResponse, $('#supervisee-list'), supervisorId);
                        $("#add-supervisee-div").addClass("hidden");
                        pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));

                    },
                    function(error) {
                        console.error(error)
                    });
            }
            bindEvents();
        }
        // Sorting

    var sorting = function(response) {
            response.sort(function(curr, next) {

                return curr["firstName"] <= next["firstName"] ? -1 : 1;
            });
            return response;
        }
        // Data population

    var populateSupervisor = function(response) {
        var container = "";
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].firstName);
            container += createContainer(response[i].firstName, response[i].lastName, response[i].id, "supervisor-details", response[i].image);
        }
        $("#supervisor-list").html(container);
        $(".highlight").click(function() {
            var supervisorId = $(this).data('id');
            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    var sortedResponse = sorting(response)
                    populateSupervisee(sortedResponse, $('#supervisee-list'), supervisorId);
                    $("#supervisee-paginate-btn").show();
                    pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                },
                function(error) {
                    console.error(error)
                });
        });
        $(".highlight").click(function() {



            if (!prevTarget) {
                $(this).addClass("selection");

                prevTarget = (event.currentTarget.className).slice(10);
                $("img[alt='Supervisor Edit Button']", $("." + prevTarget)).addClass("hidden");
                $("img[alt='Supervisor Delete Button']", $("." + prevTarget)).addClass("hidden");
                $(".glyphicon-chevron-right", $("." + prevTarget)).removeClass("hidden");
                console.log(prevTarget);
            } else {
                $(".glyphicon-chevron-right", $("." + prevTarget)).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", $("." + prevTarget)).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", $("." + prevTarget)).removeClass("hidden");
                $("." + prevTarget).removeClass("selection");
                $(this).addClass("selection");
                console.log("here");
                prevTarget = (event.currentTarget.className).slice(10);
                $("img[alt='Supervisor Edit Button']", $("." + prevTarget)).addClass("hidden");
                $("img[alt='Supervisor Delete Button']", $("." + prevTarget)).addClass("hidden");
                $(".glyphicon-chevron-right", $("." + prevTarget)).removeClass("hidden");
            }
        });
    }


    var populateSupervisee = function(response, parentContainer, supervisorId) {

        var container = "";
        console.log(response[0]);
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].firstName);
            container += createContainer(response[i].firstName, response[i].lastName, response[i].id, "supervisee-details", response[i].image);
        }
        container += '<div class="row row-margin supervisor-border sup-div-height" id="add-supervisee-div" data-supervisorId=' + supervisorId + '>' +
            '<div >' +
            '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3 div-height">' +
            '<img src="img/profile-default.png" alt="Supervisor pic" class="supervisor-pic img-circle">' +
            '</div>' +
            '<div class="col-lg-6 col-md-6 col-sm-5 col-xs-5 div-align " >' +
            '<p class="emp-name">Supervisee</p>' +
            '<p class="emp-id">XXXXXX</p>' +
            '</div>' +
            '<div  class="col-lg-2 col-md-2 col-sm-3 col-xs-3 div-height display-flex icon-padding">' +
            '<img src="img/add-button.png" alt="add-supervisee" class="icons" id="add-unassigned-supervisee" data-target="#add-supervisee-modal" data-toggle="modal" data-backdrop="static">' +
            '</div>' +
            '</div>' +
            '</div>';
        parentContainer.html(container);

        $(".supervisee-details").click(function() {
            var superviseeId = $(this).data('id');
            populateModal(superviseeId, "supervisee")
        });

        // Code for add supervisee from unassigned pool
        $("#add-supervisee-div").click(function() {
            populateUnassignedPool();
        });


    }



    var populateUnassignedPool = function() {
        db.accessData('getDataByAttribute', 'supervisee', { attribute: { supervisor: null } }, function(data) {
            console.log(data)
            var unassignedContainer = "";
            console.log(unassignedContainer)

            for (var i = 0; i < data.length; i++) {
                unassignedContainer += '<div class="col-lg-6 col-md-6 col-sm-12">' +
                    '<div class=" alignment col-lg-2 col-md-2 col-sm-2 unassigned-checkbox">' +
                    '<input type="checkbox" name="Supervisee-checkbox">' +
                    '</div>' +
                    '<div class="col-lg-4 col-md-4 col-sm-4">' +
                    '<img src=' + data[i].image + ' alt="Supervisee-img" class="img-circle supervisee-image">' +
                    '</div>' +
                    ' <div class="col-lg-6 col-md-6 col-sm-6">' +
                    '<div>' + data[i].firstName + ' ' + data[i].lastName + '</div>' +
                    ' <div class="unassigned-id" data-id=' + data[i].id + '>' + data[i].id + '</div>' +
                    '</div>' +
                    '</div>';

            }

            $('.modal-row').html(unassignedContainer);

        }, function(err) {
            console.log(err)
        });


        $('#add-unassigned-btn').click(function() {
            var checkboxList = $('.unassigned-checkbox input');
            var checkedId = $('.unassigned-id');
            var supervisorId = $('#add-supervisee-div').data('supervisorid');

            for (var i = 0; i < checkboxList.length; i++) {

                if (checkboxList[i].checked) {

                    var updateData = { id: checkedId[i].getAttribute('data-id') };
                    updateData.supervisor = supervisorId;

                    db.accessData('updateData', 'supervisee', { data: updateData }, function(data) {
                        console.log(data)
                    }, function(err) {
                        console.log(err)
                    })
                }
            }

        })
    }

    var createContainer = function(firstName, lastName, id, type, image) {
            var container = "";
            container += '<div class="row row-margin supervisor-border sup-div-height ' + type + '" >' +
                '<div class="highlight" data-id="' + id + '" data-clicked="0">' +
                '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3 div-height info-hover">' +
                '<img src="' + image + '" alt="Supervisor pic" class="supervisor-pic img-circle">' +
                '</div>' +
                '<div class="col-lg-6 col-md-6 col-sm-5 col-xs-5 div-align info-hover">' +
                '<p class="emp-name">' + firstName + " " + lastName + '</p>' +
                '<p class="emp-id">' + id + '</p>' +
                '</div>' +
                '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-3 div-height display-flex icon-padding">' +
                '<span class="icons glyphicon glyphicon-chevron-right hidden"></span>' +
                '<img src="img/edit-button.png" alt="Supervisor Edit Button" data-target="#editprofile" data-toggle="modal" data-backdrop="static" class="icons">' +
                '<img src="img/delete-button.png" alt="Supervisor Delete Button" id="delete-supervisor" class="icons" data-target="#deleteModal" data-toggle="modal" data-backdrop="static">' +
                '</div>' +
                '</div>' +
                '</div>';
            return container;

        }
        // modal functionality
    var populateModal = function(id, type) {
        var unit, image, email, supervisorId;
        if (type === "supervisee") {
            $('#editprofile').on('show.bs.modal', function() {
                $(".save-edit-modal").attr("id", "supervisee_modal_save");
                var attr = { attribute: { "id": id } };
                db.accessData('getDataByAttribute', 'supervisee', attr, function(data) {

                    $("#fname").val(data[0].firstName + ' ' + data[0].lastName);

                    $("#roleModal").val(data[0].role);
                    $("#bunit").val(data[0].businessUnit);
                    unit = data[0].unit;
                    image = data[0].image;
                    email = data[0].email;
                    supervisorId = data[0].supervisor;
                }, function(error) {
                    console.error(error)
                })
            });
            $(".save-edit-modal").on("click", updateSupervisee);
            //delete supervisee
            $("#delete-cancel").on("click", function() {
                $("#deleteModal .close").click();
            });
            $("#delete-yes").on("click", function() {
                deleteSupervisee(id);
                $("#deleteModal .close").click();
            })

            function deleteSupervisee(superviseeId) {
                db.accessData("deleteData", "supervisee", { "id": superviseeId }, function() {}),
                    function() {}
            }

            function updateSupervisee(event) {
                if (event.currentTarget.id === "supervisee_modal_save") {
                    Name = $('#fname').val();
                    var element = Name.split(" ");
                    firstName = element[0];
                    lastName = element[1];
                    role = $("#role").val();
                    businessUnit = $("#bunit").val();
                    var attr = { data: { "id": id, "firstName": firstName, "lastName": lastName, "role": role, "businessUnit": businessUnit, "image": image, "email": email, "unit": unit, "supervisor": supervisorId } }
                    var details = { data: attr.data }
                    db.accessData("updateData", "supervisee", details, function(element) {
                            for (i = 0; i < superviseeData.length; i++) {
                                if (superviseeData[i].id == id) {
                                    break;
                                }
                            }
                            superviseeData[i] = attr.data;
                            populateSupervisee(superviseeData);
                            $("#editprofile .close").click()
                        },
                        function(error) {
                            console.error(error)
                        });
                };
            }
        } else if (type === "supervisor") {
            $('#editprofile').on('show.bs.modal', function() {
                $(".save-edit-modal").attr("id", "supervisor_modal_save");
                var attr = { attribute: { "id": id } };
                db.accessData('getDataByAttribute', 'supervisor', attr, function(data) {
                        $("#fname").val(data[0].firstName + ' ' + data[0].lastName);
                        $("#bunit").val(data[0].businessUnit);
                        $("#roleModal").val(data[0].role);
                        unit = data[0].unit;
                        image = data[0].image;
                        email = data[0].email;
                    },
                    function(error) {
                        console.error(error)
                    })
            });
            $(".save-edit-modal").on("click", updateSupervisor);
            //delete Supervisor
            $("#delete-cancel").on("click", function() {
                $("#deleteModal .close").click();
            });
            $("#delete-yes").on("click", function() {
                deleteSupervisee(id);
                $("#deleteModal .close").click();
            })

            function deleteSupervisee(supervisorId) {
                db.accessData("deleteData", "supervisor", { "id": supervisorId }, function() {}),
                    function(error) {
                        console.error(error)
                    }
            }

            function updateSupervisor(event) {
                if (event.currentTarget.id === "supervisor_modal_save") {
                    Name = $('#fname').val();
                    var element = Name.split(" ");
                    firstName = element[0];
                    lastName = element[1];
                    role = $("#role").val();
                    businessUnit = $("#bunit").val();
                    var attr = { data: { "id": id, "firstName": firstName, "lastName": lastName, "role": role, "businessUnit": businessUnit, "image": image, "email": email, "unit": unit } }
                    var details = { table: "supervisor", data: attr.data }
                    db.accessData("updateData", "supervisor", details, function(element) {
                            for (i = 0; i < supervisorData.length; i++) {
                                if (supervisorData[i].id == id) {
                                    break;
                                }
                            }
                            supervisorData[i] = attr.data;
                            populateSupervisor(supervisorData);
                            $("#editprofile .close").click()
                        },
                        function(error) {
                            console.error(error)
                        });
                };
            }
        }
    }

    function AddSupervisor() {
        var supervisorFirstname = $("#Supervisor-fname").val();
        var supervisorLastname = $("#Supervisor-lname").val();
        var supervisorEmail = $('#Supervisor-email').val();
        var supervisorRole = "Senior Associate";
        var supervisorBunit = "India";
        var supervisorUnit = "XT Domain";
        var supervisorId = newId++;
        var supervisorPic = "../img/default.jpg";
        var attr1 = { data: { "id": supervisorId, "firstName": supervisorFirstname, "lastName": supervisorLastname, "role": supervisorRole, "businessUnit": supervisorBunit, "image": supervisorPic, "email": supervisorEmail, "unit": supervisorUnit } }
        var details1 = { table: "supervisor", data: attr1.data };
        db.accessData("addData", "supervisor", details1, function(data) {},
            function(error) {
                console.error(error)
            });

    }
    $('#add-supervisor').on('click', function() {
        event.preventDefault();
        AddSupervisor();
    });
    //   function closeDeleteModal(){
    //   }
    //         function deleteSupervisee(id){
    //       
    //    
    //     //  db.accessData("deleteData","supervisee",{"id":id},function(){

    //     //  }),
    //     //     function(){

    //     //   }
    //        $("#deleteModal").hide()
    //   }
    // Search Functionality


    var searchHandler = function() {
            var searchField = $("#search-bar").val().toLowerCase();
            var searchList = [];
            $.each(supervisorData, function(index, item) {

                if ((item.firstName.toLowerCase().indexOf(searchField) > -1) || (item.lastName.toLowerCase().indexOf(searchField) > -1) || ((item.id).toString().indexOf(searchField) > -1)) {
                    searchList.push(item);
                }
            });
            if (searchList.length > 0) {
                var container = populateSupervisor(searchList);
            } else {
                container = "No results found";
            }
            $("#supervisor-list").html(container);
            pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));
            searchList = null;
        }
        // Populating profile
    var renderProfile = function(table, id) {
        db.accessData("getDataByAttribute", table, { attribute: { "id": id } }, function(response) {
                $("#header-name").html(response[0].firstName + " " + response[0].lastName);
                $("#header-profile-picture").attr("src", response[0].image);
                $("#dropdown-profile-picture").attr("src", response[0].image);
                $("#profile-picture").attr("src", response[0].image);
                $("#name").html(response[0].firstName + " " + response[0].lastName);
                if (table === "admin") {
                    $("#user-type").html("Super User");
                } else if (table === "supervisor") {
                    $("#user-type").html("Supervisor");
                }
                $("#emp-id").html(response[0].id);
                $("#business-unit").html(response[0].businessUnit);
                $("#role").html(response[0].role);
                $("#unit").html(response[0].unit);
            },
            function(error) {
                console.log(error);
            });
    }

    // Pagination Function
    var pagination = function(personDetails, next, prev) {
        var maxPersonsPerPage = 5;
        var currentPage = 1;
        personDetails.hide();
        var totalPersons = personDetails.length;
        var totalPages = Math.ceil(totalPersons / maxPersonsPerPage);

        changePage(maxPersonsPerPage, currentPage, personDetails, prev, next, totalPages);

        next.off('click').on('click', function() {


            if (currentPage < totalPages) {
                currentPage++;
                changePage(maxPersonsPerPage, currentPage, personDetails, prev, next, totalPages);
            }
        });


        prev.off('click').on('click', function() {

            if (currentPage > 1) {
                currentPage--;
                changePage(maxPersonsPerPage, currentPage, personDetails, prev, next, totalPages);
            }
        });
    }



    var changePage = function(maxPersonsPerPage, currentPage, personDetails, prev, next, totalPages) {
        personDetails.hide();

        if (currentPage === 1)
            prev.addClass("btn-disabled");
        else
            prev.removeClass("btn-disabled");

        if (currentPage === totalPages)
            next.addClass("btn-disabled");
        else
            next.removeClass("btn-disabled");

        for (var i = 1; i <= maxPersonsPerPage; i++) {
            $(personDetails[currentPage * maxPersonsPerPage - i]).show();
        }
    }

    var bindEvents = function() {
        $("#search-bar").bind({ "keyup": searchHandler }, { "search": searchHandler });

        $(window).click(function() {
            if (!(event.target.matches('#dropdown-btn'))) {
                $("#dropdown-container").addClass("hidden");
            } else {
                $("#dropdown-container").toggleClass("hidden");
            }
        });

        $("#logout").on("click", function() {
            console.log('dfj')
            db.logout(function(data) {
                if (data.status === 200) {
                    console.log('write code to redirect to login page here');
                    db.removeLocalStorage('admin');
                    db.removeLocalStorage('id');
                    db.removeLocalStorage('session_id');
                }
            }, function(err) {
                console.log(err)
            });
        });
    }

    load();

    //---------------------------------Drag and Drop--------------------------------------------//
    var _flag = 0;
    var pop = function(supervisorId) {
        if (_flag == 0) {
            _flag = 1;
            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    var sortedResponse = sorting(response);
                    populateSupervisee(sortedResponse, $("#first_supervisors_supervisee"));
                    $(".supervisee-details").addClass("display-important");
                    $("#supervisee-paginate-btn").show();
                    pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                },
                function(error) {
                    console.error(error)
                });
        } else {
            _flag = 0;
            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    var sortedResponse = sorting(response);
                    populateSupervisee(sortedResponse, $("#second_supervisors_supervisee"));
                    $(".supervisee-details").addClass("display-important");
                    $("#supervisee-paginate-btn").show();
                    pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                },
                function(error) {
                    console.error(error)
                });
        }
    }


    var clicked = function() {
        console.log($(this).data("clicked"));
        debugger;
        if (countClicks === 0) {
            console.log($(this).data("clicked"));
            debugger;
            if ($(this).data("clicked") === 0) {

                countClicks++;
                debugger;
                if ($(this).hasClass("selection")) {
                    $(this).data('clicked', 1);
                }
                console.log($(this).data("clicked"));
                $(this).addClass("selection-t");

                var supervisorId = $(this).data('id');
                console.log(supervisorId);
                pop(supervisorId);
            } else {
                countClicks--;
                debugger;
                if ($(this).hasClass("selection")) {
                    $(this).data('clicked', 0);
                }

                $(this).removeClass("selection");
                $(this).removeClass("selection-t");
                $(".glyphicon-chevron-right", $(this)).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", $(this)).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", $(this)).removeClass("hidden");
                populateSupervisee(null, $("#second_supervisors_supervisee"));
                $(".supervisee-details").addClass("display-important");
                $("#supervisee-paginate-btn").show();
                pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));



            }


        } else if (countClicks === 1) {

            debugger;
            if ($(this).data("clicked") == 0) {
                console.log($(this).data("clicked"));
                if ($(this).hasClass("selection")) {
                    $(this).data('clicked', 1);
                }
                countClicks++;
                debugger;
                $(this).addClass("selection-t");

                var supervisorId = $(this).data('id');
                console.log(supervisorId);
                pop(supervisorId);

            } else {
                countClicks--;
                debugger;
                if ($(this).hasClass("selection")) {
                    $(this).data('clicked', 0);
                }
                $(this).removeClass("selection-t");
                $(this).removeClass("selection");
                $(".glyphicon-chevron-right", $(this)).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", $(this)).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", $(this)).removeClass("hidden");
                populateSupervisee(null, $("#second_supervisors_supervisee"));
                $(".supervisee-details").addClass("display-important");
                $("#supervisee-paginate-btn").show();
                pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));



            }


        } else if (countClicks === 2) {
            debugger;
            if ($(this).data("clicked") == 0) {
                $(this).removeClass("selection");
                $(".glyphicon-chevron-right", $(this)).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", $(this)).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", $(this)).removeClass("hidden");
            } else {
                countClicks--;
                debugger;
                if ($(this).hasClass("selection")) {
                    $(this).data('clicked', 0);
                    debugger;
                }
                $(this).removeClass("selection-t");
                $(this).removeClass("selection");
                $(".glyphicon-chevron-right", $(this)).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", $(this)).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", $(this)).removeClass("hidden");
                populateSupervisee(null, $("#second_supervisors_supervisee"));
                $(".supervisee-details").addClass("display-important");
                $("#supervisee-paginate-btn").show();
                pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));


            }
        }
    }
    var countClicks = 0;
    $("#re-assign-toggle").change(function() {

        if ($("#re-assign-toggle").is(":checked")) {
            countClicks = 0;
            debugger;

            $(".supervisor-details").unbind('click');
            $('#div-toggle-off').addClass("hidden");
            $('#div-toggle-on').removeClass("hidden");
            var selectedSupervisor = $(".highlight");

            selectedSupervisor.click(clicked);
            if (selectedSupervisor.hasClass("selection")) {
                selectedSupervisor.removeClass("selection");
                $(".glyphicon-chevron-right", selectedSupervisor).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", selectedSupervisor).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", selectedSupervisor).removeClass("hidden");
            }


        } else {
            if ($(".highlight").hasClass("selection")) {

                $(this).data('clicked', 0);
                selectedSupervisor.data('clicked', 0);
                console.log($(this).data("clicked"));
                selectedSupervisor.removeClass("selection");
                selectedSupervisor.removeClass("selection-t");
                $(".glyphicon-chevron-right", selectedSupervisor).addClass("hidden");

                $("img[alt='Supervisor Edit Button']", selectedSupervisor).removeClass("hidden");
                $("img[alt='Supervisor Delete Button']", selectedSupervisor).removeClass("hidden");
            }
            $('#div-toggle-on').addClass("hidden");
            $('#div-toggle-off').removeClass("hidden");

            $(".highlight").click(function() {
                var supervisorId = $(this).data('id');
                db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                        var sortedResponse = sorting(response)
                        populateSupervisee(sortedResponse, $('#supervisee-list'));
                        $("#supervisee-paginate-btn").show();
                        pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                    },
                    function(error) {
                        console.error(error)
                    });
            });
        }
    });


});





// var draggingElementParent;
// function dragOver(){
//     event.preventDefault();
//    
// }
// function dragStart(){
//     draggingElementParent="#"+$("#"+event.target.id).parent().prop("id");
//     event.dataTransfer.setData("text", event.target.id);
// }
// function drop(){
//     event.preventDefault();
//     var droppingElement="#"+event.target.id;
//     var data = event.dataTransfer.getData("text");
//     var droppingElementParent="#"+$(droppingElement).parent().prop("id");
//       if(droppingElement=="#sub1"||droppingElement=="#sub2"){
//          if(droppingElement!== draggingElementParent){
//               $(droppingElement).append($("#"+data));
//         }
//      }  
//      else{
//       if(droppingElementParent!== draggingElementParent){
//          $(droppingElement).parent().append($("#"+data));
//       }
//      }
// }
// $(function(){
//     $(document).on("dragover","#first_supervisors_supervisee,#second_supervisors_supervisee",dragOver);
//     $(document).on("drop","#first_supervisors_supervisee,#second_supervisors",drop);
//     $("#blank,#user1,#user2,#user3,#user4,#user5,#user6,#user7").on("dragstart",dragStart);   //instead of this put a for loop and add event listeneras.
// });
//---------------------------------End------------------------------------------------------//