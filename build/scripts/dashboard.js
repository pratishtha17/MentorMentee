$(function() {
    var supervisorData;
    var totalSupervisors;
    var superviseeData;
    var prevTarget = null;
    var sortedSupervisorById;
    var  totalSupervisors;
    var  selectedSupervisors  =  0;
    var  superviseesOfSupervisor1;
    var  superviseesOfSupervisor2;
    var  draggingElementParent;
    newId  =  200000;
    $("#file-input").change(function () {
        var  tmppath  =  URL.createObjectURL(event.target.files[0]);
        $("#user-img").fadeIn("fast").attr('src',  URL.createObjectURL(event.target.files[0]));
    });
    var load = function() {
        if (localStorage.admin === "true") {
            var adminId = localStorage.id;
            renderProfile("admin", adminId);
            db.accessData("getData", "supervisor", {}, function(response) {
                    supervisorData = response;
                    totalPersons = response.length;
                    supervisorData = sorting(response)
                    sortedSupervisorById = sortingID(response);
                    populateSupervisor(supervisorData);
                    pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));
                },
                function(error) {
                    console.error(error)
                });
            $("#supervisee-paginate-btn").hide();

            $("#header-edit-profile").click(function() {

                populateEditModal(adminId, "admin");

            });
        } else if (localStorage.admin === "false") {
            var supervisorId = localStorage.id;
            renderProfile("supervisor", supervisorId);
            $(".supervisor-division").addClass("hidden");
            $(".supervisee-division").removeClass("col-lg-6");
            $(".supervisee-division").addClass("col-lg-12");
            $(".supervisor-heading").hide();
            $(".supervisee-heading").addClass("supervisee-list-heading");

            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    superviseeData = response;

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
    var sorting = function(response) { //General sorting function to be used both by supervisor and supervisees
        response.sort(function(curr, next) {
            return curr["firstName"] <= next["firstName"] ? -1 : 1;
        });
        return response;
    }

    var sortingID = function(response) {
        response.sort(function(curr, next) {
            return curr["id"] <= next["id"] ? -1 : 1;
        });
        return response;
    }

    // Data population
    var populateSupervisor = function(response) { //function to populate the supervisor list 
        var container = "";
        for (var i = 0; i < response.length; i++) {

            container += createContainer(response[i].firstName, response[i].lastName, response[i].id, "supervisor-details", response[i].image);
        }
        $("#supervisor-list").html(container);
        $(".highlight").click(toggleOffClick);
        $(".supervisor-details .edit-icon").click(function() {
            var supervisorId = $(this).data("id");
            populateEditModal(supervisorId, "supervisor");
        });

        $(".supervisor-details .delete-icon").click(function() {
            var supervisorId = $(this).data("id");
            populateDeleteModal(supervisorId, "supervisor");
        });
        $("#delete-all-supervisee").on('click', function(event) {
            var supervisorId = $(".selection").data("id");
            populateDeleteModal(supervisorId, "deleteAllsupervisee");
        });
    }


    var toggleOffClick = function(event) { //function to be called when re-assign supervisee toggle is switched off
        var prevTarget = $(".selection");
        if (prevTarget != null) {
            $(".glyphicon-chevron-right", prevTarget).addClass("hidden");
            $("img[alt='Supervisor Edit Button']", prevTarget).removeClass("hidden");
            $("img[alt='Supervisor Delete Button']", prevTarget).removeClass("hidden");
            prevTarget.removeClass("selection");
        }
        var supervisorId = $(this).data('id');
        $(".glyphicon-chevron-right", $(this)).removeClass("hidden");
        $("img[alt='Supervisor Edit Button']", $(this)).addClass("hidden");
        $("img[alt='Supervisor Delete Button']", $(this)).addClass("hidden");
        $(this).addClass("selection");
        $("#supervisee-list-heading").html($(this).data('name') + "'s");
        db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                var sortedResponse = sorting(response);
                populateSupervisee(sortedResponse, $('#supervisee-list'), supervisorId);
                $("#supervisee-paginate-btn").show();
                pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
            },
            function(error) {
                console.error(error)
            });
        if (window.innerWidth < 768) {
            $(".supervisor-division").hide();
            $(".supervisee-list").show()
        }
    }

    var populateSupervisee = function(response, parentContainer, supervisorId) { //function to populate the supervisee list
        var container = "";
        for (var i = 0; i < response.length; i++) {
            container += createContainer(response[i].firstName, response[i].lastName, response[i].id, "supervisee-details", response[i].image);
        }
        container += '<div class="row row-margin supervisor-border sup-div-height supervisee-details" id="add-supervisee-div" data-supervisorId="' + supervisorId + '">' +
            '<div>' +
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
        $(".supervisee-details .edit-icon").click(function() {
            var superviseeId = $(this).data("id");
            populateEditModal(superviseeId, "supervisee");
        });
        $(".supervisee-details .delete-icon").click(function() {
            var superviseeId = $(this).data("id");
            populateDeleteModal(superviseeId, "supervisee");
        });

        // Code for add supervisee from unassigned pool
        $("#add-supervisee-div").click(function() {
            populateUnassignedPool();
        });
    }
    var populateUnassignedPool = function() { //function to populate the unassigned pool by a list of unassigned supervisees
        db.accessData('getDataByAttribute', 'supervisee', { attribute: { supervisor: null } }, function(data) {
                var unassignedContainer = "";
                for (var i = 0; i < data.length; i++) {
                    unassignedContainer += '<div class="col-lg-6 col-md-6 col-sm-6 unassigned-details">' +
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
            },
            function(err) {
                console.log(err)
            });
        $('#add-unassigned-btn').click(function() {
            var checkboxList = $('.unassigned-checkbox input');
            var checkedId = $('.unassigned-id');
            var supervisorId = $('#add-supervisee-div').data('supervisorid');
            var updateData = { id: null, supList: [] };
            for (var i = 0; i < checkboxList.length; i++) {
                if (checkboxList[i].checked) {
                    updateData.supList.push(checkedId[i].getAttribute('data-id'));
                }
            }
            updateData.id = supervisorId;
            addedSupervisees = { data: updateData };
            db.assignSupervisees(addedSupervisees, function(data) {
                    db.accessData("getDataByAttribute", "supervisee", { attribute: { supervisor: supervisorId } }, function(response) {
                            superviseeData = sorting(response);
                            populateSupervisee(superviseeData, $('#supervisee-list'), supervisorId);
                            pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                        },
                        function(err) {
                            console.log(err);
                        });
                },
                function(err) {
                    console.log(err)
                });
            $("#add-supervisee-modal .close").click();
        });
    }

    var createContainer = function(firstName, lastName, id, type, image) { //function to create and populate the supervisee container
        var container = "";
        container += '<div class="row row-margin supervisor-border sup-div-height ' + type + '" id= "' + id + '" >' +
            '<div class="highlight" data-id="' + id + '" data-clicks="0" data-container="0" data-name="' + firstName + " " + lastName + '">' +
            '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3 div-height info-hover">' +
            '<img src="' + image + '" alt="Supervisor pic" class="supervisor-pic img-circle" id="' + id + 'img">' +
            '</div>' +
            '<div class="col-lg-6 col-md-6 col-sm-5 col-xs-5 div-align info-hover">' +
            '<p class="emp-name"  data-toggle="tooltip" title="' + firstName + " " + lastName + '" id="' + id + 'name">' + firstName + " " + lastName + '</p>' +
            '<p class="emp-id" id="' + id + 'id">' + id + '</p>' +
            '</div>' +
            '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-3 div-height display-flex icon-padding">' +
            '<span class="icons glyphicon glyphicon-chevron-right hidden"></span>' +
            '<img src="img/edit-button.png" alt="Supervisor Edit Button" data-target="#editprofile" data-toggle="modal" data-backdrop="static" class="icons edit-icon" id="' + id + 'edit" data-id="' + id + '">' +
            '<img src="img/delete-button.png" alt="Supervisor Delete Button" id="delete-supervisor" class="icons delete-icon" data-target="#deleteModal" data-toggle="modal" data-backdrop="static" id="' + id + 'delete" data-id="' + id + '">' +
            '</div>' +
            '</div>' +
            '</div>' + '<div>';
        return container;
    }

    // Modal functionality
    var populateEditModal = function(id, type) { //function to populate the edit modal, on the click of edit button
        var unit, image, email, supervisorId;
        if (type === "supervisee") {
            $('#editprofile').on('show.bs.modal', function() {
                $(".save-edit-modal").attr("id", "supervisee_modal_save");
                var attr = { attribute: { "id": id } };
                db.accessData('getDataByAttribute', 'supervisee', attr, function(data) {
                    $("#fname").val(data[0].firstName + ' ' + data[0].lastName);
                    $("#roleModal").val(data[0].role);
                    $("#bunit").val(data[0].businessUnit);
                    $('#user-img').attr('src', data[0].image);
                    unit = data[0].unit;
                    image = data[0].image;
                    email = data[0].email;
                    supervisorId = data[0].supervisor;

                }, function(error) {
                    console.error(error)
                });

            });
            $(".save-edit-modal").unbind('click').bind("click", function(event) {
                event.preventDefault();
                updateSupervisee(event, id, unit, image, email, supervisorId);
                $("#editprofile .close").click();
            });
        } else if (type === "supervisor") {
            $('#editprofile').on('show.bs.modal', function() {
                $(".save-edit-modal").attr("id", "supervisor_modal_save");
                var attr = { attribute: { "id": id } };
                db.accessData('getDataByAttribute', 'supervisor', attr, function(data) {
                        $("#fname").val(data[0].firstName + ' ' + data[0].lastName);
                        $("#bunit").val(data[0].businessUnit);
                        $("#roleModal").val(data[0].role);
                        $('#user-img').attr('src', data[0].image);
                        unit = data[0].unit;
                        image = data[0].image;
                        email = data[0].email;
                    },
                    function(error) {
                        console.error(error)
                    });
            });
            $(".save-edit-modal").unbind('click').bind("click", function(event) {
                event.preventDefault();
                updateSupervisor(event, id, unit, image, email);
                $("#editprofile .close").click();
            });
        } else if (type === "admin") {
            $('#editprofile').on('show.bs.modal', function() {
                $(".save-edit-modal").attr("id", "admin_modal_save");
                var attr = { attribute: { "id": id } };
                db.accessData('getDataByAttribute', 'admin', attr, function(data) {
                        $("#fname").val(data[0].firstName + ' ' + data[0].lastName);
                        $("#bunit").val(data[0].businessUnit);
                        $("#roleModal").val(data[0].role);
                        $('#user-img').attr('src', data[0].image);
                        unit = data[0].unit;
                        image = data[0].image;
                        email = data[0].email;
                    },
                    function(error) {
                        console.error(error)
                    })
            });
            $(".save-edit-modal").unbind('click').bind("click", function(event) {

                event.preventDefault();
                updateAdmin(event, id, unit, image, email);
                $("#editprofile .close").click();
            });

        }
    }




    //Populate delete Modal
    function populateDeleteModal(id, type) { //function to populate the delete modal
        $("#delete-cancel").on("click", function() {
            $("#deleteModal .close").click();
        });
        $('#delete-yes').unbind('click').bind('click', function() {
            if (type === "supervisee") {
                deleteSupervisee(id);
                $("#deleteModal .close").click();
            } else if (type === "supervisor") {
                deleteSupervisor(id);
                $("#deleteModal .close").click();
            } else if (type === "deleteAllsupervisee") {
                deleteAllSupervisees(id);
                $("#deleteModal .close").click();
            }
        });
    }

    //Delete Supervisee
    function deleteSupervisee(superviseeId) {
        db.accessData("updateData", "supervisee", { data: { "id": superviseeId, "supervisor": null } }, function() {
                for (i = 0; i < superviseeData.length; i++) {
                    if (superviseeData[i].id === superviseeId) {
                        superviseeData.splice(i, 1);

                        break;
                    }
                }
                var supervisorId = $(".selection").data("id");
                populateSupervisee(superviseeData, $('#supervisee-list'), supervisorId);
                pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));

            },
            function() {});
    }

    //Delete Supervisor
    function deleteSupervisor(supervisorId) { //function to delete supervisor
        for (i = 0; i < supervisorData.length; i++) {
            if (supervisorData[i].id === supervisorId) {
                break;
            }
        }
        supervisorData.splice(i, 1);
        populateSupervisor(supervisorData);
        pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));

        deleteAll(supervisorId);
        db.accessData("deleteData", "supervisor", { "id": supervisorId }, function() {},
            function() {});
    }

    //Delete all supervisee
    function deleteAll(supervisorId) { //function to delete all supervisees of one supervisor
        var superData;
        db.accessData('getDataByAttribute', 'supervisee', { attribute: { supervisor: supervisorId } }, function(data) {
                for (i = 0; i < data.length; i++) {
                    if (data[i].supervisor === supervisorId) {
                        db.accessData("updateData", "supervisee", { data: { "id": data[i].id, "supervisor": null } }, function() {},
                            function() {});
                    }
                }
            },
            function(err) {});
    }

    function deleteAllSupervisees(supervisorId) { //function to validate before all supervisee deletion
        if (supervisorId != undefined) {
            deleteAll(supervisorId);
        } else {
            alert("Please select some supervisor");
        }
    }

    //UPDATE SUPERVISEE
    function updateSupervisee(event, id, unit, image, email, supervisorId) { //function to update the details of a supervisee
        if (event.currentTarget.id === "supervisee_modal_save") {
            Name = $('#fname').val();
            var element = Name.split(" ");
            firstName = element[0];
            lastName = element[1];
            role = $("#roleModal").val();
            businessUnit = $("#bunit").val();
            var attr = { data: { "id": id, "firstName": firstName, "lastName": lastName, "role": role, "businessUnit": businessUnit, "image": image, "email": email, "unit": unit, "supervisor": supervisorId } }
            var details = { data: attr.data };

            var image_data = $("#file-input").prop("files")[0];
            db.uploadImage(id, image_data, 'supervisee', function(data) {
                attr.data.image = data.image;
                db.accessData("updateData", "supervisee", details, function(element) {
                        var i;
                        for (i = 0; i < superviseeData.length; i++) {
                            if (superviseeData[i].id === id) {
                                break;
                            }
                        }

                        superviseeData[i] = attr.data;

                        populateSupervisee(superviseeData, $(".supervisee-details"));
                        pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));

                        $("#editprofile .close").click();
                        populateSupervisee(superviseeData, $(".supervisee-details"));
                        $("#editprofile .close").click();

                    },
                    function(error) {
                        console.error(error)
                    });
            }, function(err) {
                console.log(err + ' problem updating image');
            })

        };
    }

    //Update Supervisor

    function updateSupervisor(event, id, unit, image, email) { //function to update the details of a supervisor
        if (event.currentTarget.id === "supervisor_modal_save") {
            Name = $('#fname').val();
            var element = Name.split(" ");
            firstName = element[0];
            lastName = element[1];
            role = $("#roleModal").val();
            businessUnit = $("#bunit").val();
            var image_data = $("#file-input").prop("files")[0];
            var attr = { data: { "id": id, "firstName": firstName, "lastName": lastName, "role": role, "businessUnit": businessUnit, "image": image, "email": email, "unit": unit } }
            var details = { data: attr.data }
            db.uploadImage(id, image_data, 'supervisor', function(data) {
                attr.data.image = data.image;
                db.accessData("updateData", "supervisor", details, function(element) {
                        for (i = 0; i < supervisorData.length; i++) {
                            if (supervisorData[i].id == id) {
                                break;
                            }
                        }
                        supervisorData[i] = attr.data;
                        populateSupervisor(supervisorData);
                        pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));
                        $("#editprofile .close").click();
                    },
                    function(error) {
                        console.error(error)
                    });
            });
        }
    }
    //update admin
    function updateAdmin(event, id, unit, image, email) {
        if (event.currentTarget.id === "admin_modal_save") {
            Name = $('#fname').val();
            var element = Name.split(" ");
            firstName = element[0];
            lastName = element[1];
            role = $("#roleModal").val();
            businessUnit = $("#bunit").val();
            var attr = { data: { "id": id, "firstName": firstName, "lastName": lastName, "role": role, "businessUnit": businessUnit, "image": image, "email": email, "unit": unit } }
            var details = { data: attr.data }
            db.accessData("updateData", "admin", details, function(element) {
                    renderProfile("admin", id);
                    $("#editprofile .close").click();
                },
                function(error) {
                    console.error(error)
                });
        };
    }

    function AddSupervisor() {
        var supervisorFirstname = $("#Supervisor-fname").val();
        var supervisorLastname = $("#Supervisor-lname").val();
        var supervisorEmail = $('#Supervisor-email').val();
        var supervisorRole = "Senior Associate";
        var supervisorBunit = "India";
        var supervisorUnit = "XT Domain";
        var len = sortedSupervisorById.length;
        var newId = sortedSupervisorById[len - 1].id;
        var supervisorId = newId + 1;
        var supervisorPic = "http:10.150.222.28:2020/img/profile-default.jpg";
        var attr1 = { data: { "id": supervisorId, "firstName": supervisorFirstname, "lastName": supervisorLastname, "role": supervisorRole, "businessUnit": supervisorBunit, "image": supervisorPic, "email": supervisorEmail, "unit": supervisorUnit } }
        var details1 = { table: "supervisor", data: attr1.data };
        db.accessData("addData", "supervisor", details1, function(data) {
                supervisorData.splice(1, 0, attr1.data);
                supervisorData = sorting(supervisorData);
                sortedSupervisorById = sortingID(supervisorData);
                populateSupervisor(supervisorData);
                pagination($('.supervisor-details'), $('#supervisor-next-button'), $('#supervisor-prev-button'));
            },
            function(error) {
                console.error(error)
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

    var changePage = function(maxPersonsPerPage, currentPage, personDetails, prev, next, totalPages) { //function for next set of data for pagination
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


    // Search Functionality
    var searchHandler = function() { // Search function
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
    var renderProfile = function(table, id) { //function to render login user's profile
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
                $("#profile-role").html(response[0].role);
                $("#unit").html(response[0].unit);
            },
            function(error) {
                console.log(error);
            });

        $('#add-supervisor').unbind('click').bind('click', function() {
            event.preventDefault();
            AddSupervisor();
            $("#Add-supervisor-modal .close").click();
            $("#Supervisor-fname").val('');
            $("#Supervisor-lname").val('');
            $('#Supervisor-email').val('');
        });

    }



    var bindEvents = function() { // A function to bind all event handlers to their buttons
        $("#search-bar").bind({ "keyup": searchHandler }, { "search": searchHandler });
        $(window).click(function(event) {
            if (!(event.target.matches('#dropdown-btn')) && !(event.target.matches('#header-name')) && !(event.target.matches('.header-username-div'))) {
                $("#dropdown-container").addClass("hidden");
            } else {
                $("#dropdown-container").toggleClass("hidden");
            }
        });
        $("#logout").on("click", function() {
            db.logout(function(data) {
                    db.removeLocalStorage("id");
                    db.removeLocalStorage("admin");
                    db.removeLocalStorage("session_id");
                    window.location = "index.html";
                },
                function(error) {});
        });


    }




    //---------------------------------Drag and Drop--------------------------------------------//
    var pop = function(supervisorId) { //function when popped in drag and drop

        if ($("#first-supervisors-supervisee").children().length === 0) {

            $("#first-supervisors-supervisee").removeClass("hidden").addClass("display-important");
            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    var sortedResponse = sorting(response);
                    populateSupervisee(sortedResponse, $("#first-supervisors-supervisee"));
                    $(".supervisee-details").addClass("display-important");
                    $("#supervisee-paginate-btn").show();
                    pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                    if ($("#first-supervisors-supervisee").children().length > 0 && $("#second-supervisors-supervisee").children().length > 0 && !$("#first-supervisors-supervisee").hasClass("hidden") && !$("#second-supervisors-supervisee").hasClass("hidden")) { dragAndDrop(); }
                },
                function(error) {
                    console.error(error)
                });
        } else if ($("#second-supervisors-supervisee").children().length === 0) {
            $("#second-supervisors-supervisee").removeClass("hidden").addClass("display-important");
            db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                    var sortedResponse = sorting(response);
                    populateSupervisee(sortedResponse, $("#second-supervisors-supervisee"));
                    $(".supervisee-details").addClass("display-important");
                    $("#supervisee-paginate-btn").show();
                    pagination($('.supervisee-details'), $('#supervisee-next-button'), $('#supervisee-prev-button'));
                    if ($("#first-supervisors-supervisee").children().length > 0 && $("#second-supervisors-supervisee").children().length > 0 && !$("#first-supervisors-supervisee").hasClass("hidden") && !$("#second-supervisors-supervisee").hasClass("hidden")) { dragAndDrop(); }
                },
                function(error) {
                    console.error(error)
                });
        }
    }


    $("#re-assign-toggle").change(function() { //on toggle of re-assign supervisee button
        if ($("#re-assign-toggle").is(":checked")) {
            $("#supervisee-list-heading").html('');
            $("#supervisee-list").html('');
            $('#div-toggle-off').addClass("hidden");
            $('#div-toggle-on').removeClass("hidden");
            $('.highlight').removeClass("selection");
            $("img[alt='Supervisor Edit Button']", $('.highlight')).removeClass("hidden");
            $("img[alt='Supervisor Delete Button']", $('.highlight')).removeClass("hidden");
            $(".glyphicon-chevron-right", $('.highlight')).addClass("hidden");
            $(".add-supervisor-btn").addClass("visibility-hidden");
            $(".highlight").unbind('click');
            $(".highlight").click(toggleOnClick);
        } else {
            $('#div-toggle-on').addClass("hidden");
            $('#div-toggle-off').removeClass("hidden");
            $("#supervisee-paginate-btn").hide();
            selectedSupervisors = 0;
            $('.selection').data('clicks', 0);
            $('.selection').data('container', 0);
            $('.highlight').removeClass("selection");
            $("#first-supervisors-supervisee").html('');
            $("#first-supervisee-list-heading").html('');
            $("#second-supervisors-supervisee").html('');
            $("#second-supervisee-list-heading").html('');
            $("img[alt='Supervisor Edit Button']", $('.highlight')).removeClass("hidden");
            $("img[alt='Supervisor Delete Button']", $('.highlight')).removeClass("hidden");
            $(".glyphicon-chevron-right", $('.highlight')).addClass("hidden");
            $(".add-supervisor-btn").removeClass("visibility-hidden");
            $(".highlight").unbind('click');
            $(".highlight").click(toggleOffClick);
        }
    })

    var toggleOnClick = function(event) { //function when toggle is switched on
        if ($(this).data('clicks') === 1) {
            $(this).data('clicks', 0);
            $(this).removeClass("selection");
            if ($(this).data('container') === 1) {
                $("#first-supervisors-supervisee").html('');
                $("#first-supervisee-list-heading").html('');
            } else {
                $("#second-supervisors-supervisee").html('');
                $("#second-supervisee-list-heading").html('');
            }
            selectedSupervisors--;
            $(this).data('container', 0);
            $("img[alt='Supervisor Edit Button']", $(this)).removeClass("hidden");
            $("img[alt='Supervisor Delete Button']", $(this)).removeClass("hidden");
            $(".glyphicon-chevron-right", $(this)).addClass("hidden");
        } else if ($(this).data('clicks') === 0 && selectedSupervisors < 2) {
            if ($("#first-supervisors-supervisee").children().length === 0) {
                var supervisorId = $(this).data('id');
                supervisorId1 = $(this).data('id');
                $("#first-supervisee-list-heading").html((($(this).data('name')).split(" "))[0] + "'s Supervisee List");
                db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                        var sortedResponse = sorting(response)
                        populateSupervisee(sortedResponse, $("#first-supervisors-supervisee"), supervisorId);
                    },
                    function(error) {
                        console.error(error)
                    });
                $(this).data('container', 1);
            } else {
                var supervisorId = $(this).data('id');
                supervisorId2 = $(this).data('id');
                $("#second-supervisee-list-heading").html((($(this).data('name')).split(" "))[0] + "'s Supervisee List");
                db.accessData("getDataByAttribute", "supervisee", { attribute: { "supervisor": supervisorId } }, function(response) {
                        var sortedResponse = sorting(response)
                        populateSupervisee(sortedResponse, $("#second-supervisors-supervisee"), supervisorId);
                        dragAndDrop();
                    },
                    function(error) {
                        console.error(error)
                    });
                $(this).data('container', 2);
            }
            selectedSupervisors++;
            $(this).data('clicks', 1);
            $(this).addClass("selection");
            $("img[alt='Supervisor Edit Button']", $(this)).addClass("hidden");
            $("img[alt='Supervisor Delete Button']", $(this)).addClass("hidden");
            $(".glyphicon-chevron-right", $(this)).removeClass("hidden");
        }
    }

    function dragAndDrop() { //function toggled when drag and drop is to be uses
        bindDragAndDropEvents();
        $("#save-btn").on("click", saveAndPopulateSupervisees);
        $("#cancel-btn").on("click", populateOldSupervisees);
    }

    function bindDragAndDropEvents() { //function to bing all events to buttons of drag and drop
        superviseesOfSupervisor1 = $("#first-supervisors-supervisee").children();
        superviseesOfSupervisor2 = $("#second-supervisors-supervisee").children();
        superviseesOfSupervisor1.attr("draggable", "true");
        superviseesOfSupervisor2.attr("draggable", "true");
        $(document).on("dragover", "#first-supervisors-supervisee,#second-supervisors-supervisee", dragOver);
        $(document).on("drop", "#first-supervisors-supervisee,#second-supervisors-supervisee", drop);
        superviseesOfSupervisor1.each(function() {
            $("#" + this.id).on("dragstart", dragStart);
        });
        superviseesOfSupervisor2.each(function() {
            $("#second-supervisors-supervisee #" + this.id).on("dragstart", dragStart);
        });
    }

    function dragOver() { //when being dragged over
        event.preventDefault();
    }

    function dragStart() { //function when dragging is started
        draggingElementParent = "#" + $(event.target).parent().prop("id");
        event.dataTransfer.setData("draggingElement", event.target.id);
    }

    function drop() { //function executed when draggable item is dropped
        event.preventDefault();
        var droppingElement = "#" + event.target.id;
        if (droppingElement !== "#second-supervisors-supervisee" && droppingElement !== "#first-supervisors-supervisee") {
            droppingElement = "#" + $(droppingElement).parents(".list-scroll").prop("id");
        }
        var data = event.dataTransfer.getData("draggingElement");
        var droppingElementParent = "#" + $(droppingElement).parent().prop("id");
        if (droppingElement == "#first-supervisors-supervisee" || droppingElement == "#second-supervisors-supervisee") {
            if (droppingElement !== draggingElementParent) {
                $(droppingElement).append($("#" + data));
            }
        }
    }

    function populateOldSupervisees() { //fucntion to populate the supervisee
        $("#first-supervisors-supervisee").html("");
        $("#second-supervisors-supervisee").html("");
        pop(supervisorId1);
        setTimeout(function() { pop(supervisorId2); }, 200);
    }

    function saveInDb(supervisorId, supList) { //fucntion to update list in database
        var supervisees = { data: { id: supervisorId, supList: supList } }
        db.assignSupervisees(supervisees, function(data) {
                populateOldSupervisees();
            },
            function(error) {
                console.log(error);
            });
    }

    function saveAndPopulateSupervisees() { //function to save and populate the dragged and changed supervisees
        superviseesOfSupervisor1 = $("#first-supervisors-supervisee").children();
        superviseesOfSupervisor2 = $("#second-supervisors-supervisee").children();
        var supList = [];
        superviseesOfSupervisor1.each(function() {
            if (this.id !== "add-supervisee-div")
                supList.push(parseInt(this.id));
        });
        saveInDb(supervisorId1, supList);
        supList = [];
        superviseesOfSupervisor2.each(function() {
            if (this.id !== "add-supervisee-div")
                supList.push(parseInt(this.id));
        });
        saveInDb(supervisorId2, supList);
    }

    load();
});