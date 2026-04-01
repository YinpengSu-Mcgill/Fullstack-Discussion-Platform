document.addEventListener('DOMContentLoaded', function () {

    fetch('../../includes/auth.php')
        .then(response => response.json())
        .then(authData => {
            if (!authData.logged) {
                window.location.href = '../../index.php';
                return;
            }

            fetch('../../api/dashboardAPI/onloadGetGeneralInfo.php')
                .then(response => response.json())
                .then(userInfo => {
                   
                    window.userDetails = userInfo;

                    fetch('../../api/dashboardAPI/onloadGetCourses.php')
                        .then(response => response.json())
                        .then(data => {
                        console.log(data);
                        const boardsContainer = document.getElementById('boardsContainer');
                        data.forEach(board => {
                        createCourseBoard(board.id, board.course_name, board.semester);
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
                

                    if (userInfo.user_role === 'professor' || userInfo.user_role === 'admin') {
                        document.getElementById('createCourseBtn').style.display = 'block';
                    } else {
                        document.getElementById('createCourseBtn').style.display = 'none';
                    }

                    if (userInfo.user_role === 'admin') {
                        document.getElementById('joinCourseBtn').style.display = 'none';
                    } else {
                        document.getElementById('joinCourseBtn').style.display = 'block';
                    }


                })
                .catch(error => {
                    console.error('Error fetching user info:', error);
                });

            const userIcon = document.getElementById('dropdownIcon');
            const userInfoDisplay = document.getElementById('userInfo');

            function populateUserInfo() {
                userInfoDisplay.innerHTML = `
                <p>Name: ${window.userDetails.user_first_name} ${window.userDetails.user_last_name}</p>
                <hr class="divider">
                <p>Email: ${window.userDetails.user_email}</p>
                <hr class="divider">
                <p>Role: ${window.userDetails.user_role}</p>
                <hr class="divider">
            `;
            }

            userIcon.addEventListener('click', function () {
                if (window.userDetails) {
                    populateUserInfo();
                    const dropdownContent = document.getElementById('dropdownContent');
                    dropdownContent.classList.toggle('show');
                } else {
                    console.error('User details not loaded yet.');
                }
            });

            window.onclick = function (event) {
                if (!event.target.matches('.dropdown-icon')) {
                    const dropdowns = document.getElementsByClassName('dropdown-content');
                    for (let i = 0; i < dropdowns.length; i++) {
                        const openDropdown = dropdowns[i];
                        if (openDropdown.classList.contains('show')) {
                            openDropdown.classList.remove('show');
                        }
                    }
                }

                if (event.target == joinCourseModal) {
                    joinCourseModal.style.display = 'none';
                }

                if (event.target == createCourseModal) {
                    createCourseModal.style.display = 'none';
                }

                if (event.target == deleteCourseModal) {
                    deleteCourseModal.style.display = 'none';
                }

                if (event.target == confirmDelete) {
                    confirmDelete.style.display = 'none';
                }


            };


            document.getElementById('logout-button').addEventListener('click', function () {
                window.location.href = '../../logout.php'; // Redirect to logout.php
            });

           
            var joinCourseModal = document.getElementById('joinCourseModal');
            var createCourseModal = document.getElementById('createCourseModal');
           
            var joinCourseBtn = document.getElementById('joinCourseBtn');
            var createCourseBtn = document.getElementById('createCourseBtn');
            
            var closeSpan = document.getElementsByClassName('close')[0];
            var closeSpan2 = document.getElementsByClassName('close')[1];
            var closeSpan3 = document.getElementsByClassName('close')[2];
            var closeSpan4 = document.getElementsByClassName('close')[3];
            
            joinCourseBtn.onclick = function () {
                joinCourseModal.style.display = 'block';

                document.getElementById('inviteLinkInput').value = '';
                document.getElementById('joinCourseError').textContent = '';
            }


            createCourseBtn.onclick = function () {
                createCourseModal.style.display = 'block';

                document.getElementById('CoursenameInput').value = '';
                document.getElementById('SemesterInput').value = '';
                document.getElementById('createCourseError').textContent = '';
            }

            closeSpan.onclick = function () {
                joinCourseModal.style.display = 'none';
            }

            closeSpan2.onclick = function () {
                createCourseModal.style.display = 'none';
            }

            closeSpan3.onclick = function () {
                deleteCourseModal.style.display = 'none';
            }

            closeSpan4.onclick = function () {
                confirmDelete.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});










function createCourseBoard(courseId, courseName, semester) {
    const boardsContainer = document.getElementById('boardsContainer');


    const boardDiv = document.createElement('div');
    boardDiv.className = 'board-info';
    boardDiv.style.cursor = 'pointer';
    boardDiv.setAttribute('data-course-id', courseId);

    
    const textContent = `Course Name: ${courseName}, Semester: ${semester}`;
    boardDiv.appendChild(document.createTextNode(textContent));
    
    if (window.userDetails && (window.userDetails.user_role === 'professor' || window.userDetails.user_role === 'admin')) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-board-btn';
        deleteBtn.innerHTML = '<img src="../../assets/icon/delete_circle.png" alt="Delete">';
        deleteBtn.onclick = function(event) {
            event.stopPropagation();
            openDeleteCourseModal(courseId, courseName, semester);
        };
        boardDiv.appendChild(deleteBtn);
    }


    boardDiv.addEventListener('click', function () {
        fetch('../../api/dashboardAPI/setCourseID.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({course_id: courseId})
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                window.location.href = '../../discussion/views/discussion.html';
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    boardsContainer.appendChild(boardDiv);
}










document.getElementById('submitInviteLink').addEventListener('click', function () {
    var inviteLink = document.getElementById('inviteLinkInput').value;
    if (inviteLink.trim() === '') {
        document.getElementById('joinCourseError').textContent = 'Please enter an invite link.';
        return;
    }

    document.getElementById('joinCourseError').textContent = '';
    fetch('../../api/dashboardAPI/joinBoard.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({invite_code: inviteLink})
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.state === 'success') {
                const courseInfo = data.course_info;
                console.log(courseInfo);
                createCourseBoard(courseInfo.id, courseInfo.course_name, courseInfo.semester);

                document.getElementById('joinCourseModal').style.display = 'none';
            } else {
                document.getElementById('joinCourseError').textContent = data.error_message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('joinCourseError').textContent = 'An error occurred while joining the course.';
        });
});










document.getElementById('submitcreate').addEventListener('click', function () {
    var CoursenameInput = document.getElementById('CoursenameInput').value;
    var SemesterInput = document.getElementById('SemesterInput').value;

    if (CoursenameInput.trim() === '' && SemesterInput.trim() === '') {
        document.getElementById('createCourseError').textContent = 'Please enter a course and a semester.';
        return;
    }
    if (CoursenameInput.trim() === '' && SemesterInput.trim() !== '') {
        document.getElementById('createCourseError').textContent = 'Please enter a course.';
        return;
    }
    if (SemesterInput.trim() === '' && CoursenameInput.trim() !== '') {
        document.getElementById('createCourseError').textContent = 'Please enter a semester.';
        return;
    }


    document.getElementById('createCourseError').textContent = '';
    fetch('../../api/dashboardAPI/createBoard.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({course_name: CoursenameInput, semester: SemesterInput})
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.state === 'success') {
                const courseInfo = data.course_info;
                console.log(courseInfo);
                createCourseBoard(courseInfo.id, courseInfo.course_name, courseInfo.semester);

                document.getElementById('createCourseModal').style.display = 'none';
            } else {
                document.getElementById('createCourseError').textContent = data.error_message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('createCourseError').textContent = 'An error occurred while creating the course.';
        });
});









function deleteBoard(courseId) {
    fetch('../../api/dashboardAPI/deleteBoard.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_id: courseId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.state === 'success') {
            const boardToRemove = document.querySelector(`.board-info[data-course-id='${courseId}']`);
            if (boardToRemove) {
                boardToRemove.remove();
                document.getElementById('confirmDelete').style.display = 'none';
                document.getElementById('deleteCourseModal').style.display = 'none';
            }
        } else {
            document.getElementById('deleteCourseError').textContent = data.error_message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('deleteCourseError').textContent = 'An error occurred while deleting the course.';
    });
}










function closeConfirmDeleteCourseModal() {
    document.getElementById('confirmDelete').style.display = 'none';
}


function confirmDeleteCourse() {
    document.getElementById('confirmDelete').style.display = 'block';
}

function deleteCourse() {
    var courseId = document.getElementById('deleteCourseModal').getAttribute('data-course-id');

    if (courseId) {
        deleteBoard(courseId);
    }
}


function openDeleteCourseModal(courseId, courseName, semester) {
    document.getElementById('course-to-delete').value = `${courseName}, ${semester}`;
    document.getElementById('deleteCourseModal').setAttribute('data-course-id', courseId);
    document.getElementById('deleteCourseModal').style.display = 'block';
}
