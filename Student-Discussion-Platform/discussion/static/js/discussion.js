let currentChannel = null; // 当前频道名称
let currentRole = null; // 当前人员身份
let currentEmail = null; // 当前人员邮箱
let apiURL = '../../api/discussionAPI/onloadGetGeneralInfo.php';
//onloadGetGeneralInfo
//onloadGetPosts
//onloadGetMember

function testapi(apiURL){
    // 使用fetch调用API
    fetch(apiURL)
    .then(response => {
        // 首先检查响应的状态码
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        // 解析JSON响应
        return response.json();
    })
    .then(data => {
        // 处理数据
        console.log('from ',{apiURL},' received:', data);
        // 假设 'data' 是一个包含频道信息的数组
        // 你可以在这里编写代码将这些信息渲染到页面上
    })
    .catch(error => {
        // 处理错误情况
        console.error('There has been a problem with your fetch operation:', error);
    });

}

testapi(apiURL);

// 登录安全和页面初始化
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();

    loadHeaderElements();
    loadChannels();
    setupSendButton();
    loadPinnedPosts();
    
    // 在页面加载时调用模态关闭相关
    setupMemberModalEvents();
    setupChannelModalEvents();
});


// 登录安全
function checkLoginStatus() {
    fetch('../../includes/auth.php')
        .then(response => response.json())
        .then(authData => {
            if (!authData.logged) {
                window.location.href = '../../index.php'; // 这个地方的路径将来要改变
                return;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};



// 假设 somewhere in your code, currentRole is being set based on the logged-in user's role
// 例如：let currentRole = 'student'; // 这个值应该根据登录用户的角色动态设置


// 加载页眉元素
function loadHeaderElements() {
    fetch('../../api/discussionAPI/onloadGetGeneralInfo.php')
        .then(response => {
            if (!response.ok) {
                window.location.href = '../../dashboard/views/dashboard.html';
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            
            // 在这里赋值全局变量，确保它们保持更新
            currentRole = data.user_role;
            currentEmail = data.user_email;
            document.title = data.course_name + " - Discussion Board";

            console.log("loadheader", currentRole, currentEmail);
            selectAnnouncementsChannel(currentRole);
            loadChannelMessages("Announcements")
            // 下拉栏角色判定
            setupDropdownsBasedOnRole(currentRole);
            loadMembers(currentRole);

            // 动态设置 HTML 元素的内容
            document.getElementById('userInfo').innerHTML = `
                <p>Name: ${data.user_first_name} ${data.user_last_name}</p>
                <hr class="divider">
                <p>Email: ${data.user_email}</p>
                <hr class="divider">
                <p>Role: ${currentRole}</p>
                <hr class="divider">
            `;
            document.getElementById('courseInfo').innerHTML = `
                <p>${data.semester}</p>
                <p>${data.course_name}</p>
            `;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// 为 "Announcements" 频道 <div> 元素添加点击事件监听器
document.getElementById('announcement-channel').addEventListener('click', () => {
    loadAnnouncementsContent(); // 点击时调用此函数
});

// 页面加载时调用此函数来加载 "Announcements" 频道的内容
function loadAnnouncementsContent() {
    currentChannel = 'Announcements'; // 设置当前频道为 "Announcements"
    updateInputVisibility(currentChannel, currentRole); // 根据当前角色更新输入区域的可见性
    loadChannelMessages(currentChannel); // 加载 "Announcements" 频道的消息
}

// 最开始自动选择Announcements Channel的函数
function selectAnnouncementsChannel(currentRole) {
    const channelElements = document.querySelectorAll('.channel-name');
    let found = false;
    
    channelElements.forEach(channel => {
        if (channel.textContent.includes('Announcements')) {
            channel.click();
            found = true;
            updateInputVisibility(currentChannel,currentRole);
        }
    });

    if (!found) {
        console.log('Announcements channel not found');
    }
}


// 返回到选择board
document.getElementById('back-icon').addEventListener('click', function() {
    window.location.href = '../../dashboard/views/dashboard.html'; //后续要改
});

// 当用户点击大 Pin 按钮时切换显示下拉内容
document.getElementById('headerPinButton').addEventListener('click', function(event) {
    document.getElementById('pinnedPostsDropdown').classList.toggle('show');
    loadPinnedPosts();
    event.stopPropagation(); // 阻止事件冒泡到 window
});

// 当用户点击下拉图标时切换显示下拉内容
document.getElementById('dropdownIcon').addEventListener('click', function(event) {
    document.getElementById('dropdownContent').classList.toggle('show');
    event.stopPropagation(); // 阻止事件冒泡到 window
});

// 添加全局点击事件监听器来关闭下拉内容
window.addEventListener('click', function(event) {
    // 获取下拉栏元素
    var pinnedPostsDropdown = document.getElementById('pinnedPostsDropdown');
    var dropdownContent = document.getElementById('dropdownContent');

    // 如果点击的不是下拉栏或其触发按钮，则关闭下拉栏
    if (!event.target.matches('#headerPinButton') && pinnedPostsDropdown.classList.contains('show')) {
        pinnedPostsDropdown.classList.remove('show');
    }
    if (!event.target.matches('#dropdownIcon') && dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
    }
});



// 退出登录
document.getElementById('logout-button').addEventListener('click', function() {
    // console.log;
    window.location.href = '../../logout.php';
});


// 加载频道
function loadChannels() {
    fetch('../../api/discussionAPI/onloadGetChannel.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); // 解析JSON数据
        })
        .then(data => {
            console.log(data, currentRole);
            const channelsContainer = document.getElementById('channels-container');
            channelsContainer.innerHTML = ''; // 清空现有内容

            data.forEach(channel => {
                if (channel.name !== 'Announcements') { // 确保跳过 "Announcements" 频道
                    const p = document.createElement('p');
                    p.classList.add('channel-name');
                    p.textContent = `# ${channel.name}`;
                    p.addEventListener('click', () => {
                        currentChannel = channel.name;
                        updateInputVisibility(currentChannel, currentRole);
                        loadChannelMessages(currentChannel);
                    });
                    channelsContainer.appendChild(p);
                }
            });
            // 最开始自动选择Announcements Channel
            selectAnnouncementsChannel();
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}




// 更新输入区域的可见性
function updateInputVisibility(channelName,role) {
    const inputArea = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button-id');
    //console.log("可见性updateInputVisibility:",currentChannel)
    // 首先检查是否是 'Announcements' 频道
    if (channelName === 'Announcements') {
        // 在 'Announcements' 频道中进一步检查用户角色
        //console.log("可见性Role:",currentRole)
        if (currentRole === 'admin' || currentRole === 'professor' || currentRole === 'ta') {
            // 如果用户是教授或助教，显示输入区域和发送按钮
            inputArea.classList.remove('hidden');
            sendButton.classList.remove('hidden');
        } else {
            // 如果用户不是教授或助教，隐藏输入区域和发送按钮
            inputArea.classList.add('hidden');
            sendButton.classList.add('hidden');
        }
    } else {
        // 如果不是 'Announcements' 频道，不考虑用户角色，直接显示输入区域和发送按钮
        inputArea.classList.remove('hidden');
        sendButton.classList.remove('hidden');
    }
}


// 加载频道内聊天信息
function loadChannelMessages(channelName) {
    // 准备发送的数据
    const data = JSON.stringify({ channel_name: channelName });

    // 发送请求到服务器
    fetch('../../api/discussionAPI/getPostInChannel.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json(); // 解析JSON数据
    })
    .then(response => {
        if (response.state !== 'success') {
            throw new Error(response.error_message || 'Error loading posts');
        }
        return response.posts; // 使用返回的 posts 数据
    })
    .then(posts => {
        displayPosts(posts, channelName); // 显示帖子
    })
    .catch(error => {
        console.error('Fetch error:', error); // 捕捉并打印出错信息
    });
}

// 显示帖子的函数
function displayPosts(posts, channelName) {
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `<h2>Channel: ${channelName}</h2>`; // 显示频道名称

    if (posts.length) {
        posts.forEach(post => {
             // 创建每个消息的容器
             const messageDiv = document.createElement('div');
             messageDiv.classList.add('message');

             // 添加消息内容
             const textDiv = document.createElement('div');
             textDiv.innerHTML = `<p><strong>${post.first_name} ${post.last_name}</strong> <span>${new Date(post.post_time).toLocaleString()}</span></p><p>${post.content}</p>`;
             
             // 将消息添加到内容区域
             messageDiv.appendChild(textDiv);
             contentArea.appendChild(messageDiv);

             // 根据返回的 PIN 状态设置 Pin 按钮的初始状态
             const pinButton = document.createElement('img');
             pinButton.classList.add('pin-button');
             pinButton.src = post.PIN === "true" ? '../../assets/icon/pin-fill.png' : '../../assets/icon/pin.png';
             pinButton.setAttribute('data-pinned', post.PIN === "true" ? 'true' : 'false');

             // 绑定 Pin 按钮的点击事件
             pinButton.onclick = function() {
                 let isPinned = pinButton.getAttribute('data-pinned') === 'true';
                 let apiEndpoint = isPinned ? 'unpinPost.php' : 'pinPost.php';
                 let postId = post.post_id;

                 fetch('../../api/discussionAPI/' + apiEndpoint, {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({ post_id: postId })
                 })
                 .then(response => response.json())
                 .then(data => {
                     if (data.state === 'success') {
                         // 切换 Pin 按钮的状态和图标
                         pinButton.src = isPinned ? '../../assets/icon/pin.png' : '../../assets/icon/pin-fill.png';
                         pinButton.setAttribute('data-pinned', isPinned ? 'false' : 'true');
                     } else {
                         throw new Error(data.error_message);
                     }
                 })
                 .catch(error => {
                     console.error('Error during pinning/unpinning post:', error);
                 });
             };
             

             // Style the button to be a bit smaller and remove the border
             pinButton.width = 16; // 设置图标宽度
             pinButton.height = 16; // 设置图标高度
             pinButton.style.border = 'none';
             pinButton.style.background = 'none';
             pinButton.style.cursor = 'pointer';

             // 添加 Pin 和删除按钮到消息容器
             textDiv.appendChild(pinButton);

             // Add the pin button next to the time span
             const timeSpan = textDiv.querySelector('span');
             timeSpan.parentNode.insertBefore(pinButton, timeSpan.nextSibling);

             if (currentRole === 'admin' || currentRole === 'professor' || currentRole === 'ta') {
                 // 创建删除按钮
                 const deleteButton = document.createElement('img');
                 deleteButton.src = '../../assets/icon/delete.png'; // 删除图标
                 deleteButton.onclick = function() {
                     // 显示删除确认模态框
                     document.getElementById('confirm-delete-post-modal').style.display = 'block';
                     // 设置要删除的帖子 ID
                     sessionStorage.setItem('postToDelete', post.post_id);
                 };
             
                 // 设置删除按钮样式
                 deleteButton.width = 16; // 设置图标宽度
                 deleteButton.height = 16; // 设置图标高度
                 deleteButton.style.border = 'none';
                 deleteButton.style.background = 'none';
                 deleteButton.style.cursor = 'pointer';

                 // 添加删除按钮到消息容器
                 textDiv.appendChild(deleteButton);
             }
             
        });
    } else {
        contentArea.innerHTML += "<p>No posts to display for this channel.</p>";
    }
}






// 发送按钮
function setupSendButton() {
    // 获取发送按钮和输入框
    const sendButton = document.getElementById('send-button-id');
    const inputBox = document.getElementById('message-input');

    // 为发送按钮绑定点击事件监听器
    sendButton.addEventListener('click', addPost); // 直接绑定 addPost 函数

    // 为输入框绑定键盘按下事件监听器
    inputBox.addEventListener('keypress', function(event) {
        // 检查按下的键是否是回车键
        if (event.key === 'Enter' || event.keyCode === 13) {
            addPost(); // 调用发送消息的函数
            event.preventDefault(); // 防止默认行为，比如表单提交
        }
    });
}


// 发送功能
function addPost() {
    // 获取输入框中的文本内容
    const textContent = document.getElementById('message-input').value;
    // 获取当前时间
    const time = new Date().toISOString();

    if (currentChannel && textContent.trim() !== '') {
        // 发送数据到服务器
        fetch('../../api/discussionAPI/addPost.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                time: time,
                channel_name: currentChannel,
                text_content: textContent
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response from add post:',data); // 打印返回的数据
            if (data.state === 'success') {
                console.log('Message sent successfully. Post ID:', data.post_id);
                // 清空输入框
                document.getElementById('message-input').value = '';
                loadChannelMessages(currentChannel); // 重新加载当前频道的消息
            } else {
                console.error('Failed to send message:', data.error_message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } 
}




// 加载成员
function loadMembers() {
    fetch('../../api/discussionAPI/onloadGetMember.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); // 解析JSON数据
        })
        .then(data => {
            const professorsContainer = document.getElementById('Professor-container');
            const TAsContainer = document.getElementById('TAs-container');
            const studentsContainer = document.getElementById('Students-container');
            professorsContainer.innerHTML = '';
            TAsContainer.innerHTML = '';
            studentsContainer.innerHTML = '';

            data.forEach(member => {
                const div = document.createElement('div');
                div.classList.add('member-info');
                const name = document.createElement('p');
                name.textContent = `${member.first_name} ${member.last_name}`;
                div.appendChild(name);
                const roleLower = member.role.toLowerCase();

                if (roleLower === 'professor') {
                    professorsContainer.appendChild(div);
                } else if (roleLower === 'ta') {
                    TAsContainer.appendChild(div);
                } else if (roleLower === 'student') {
                    studentsContainer.appendChild(div);
                }

                if ((currentRole === 'admin' || currentRole === 'professor') && (roleLower === 'ta' || roleLower === 'student')) {
                    createDropdown(member, div);
                } else if (currentRole === 'ta' && roleLower === 'student') {
                    createDropdown(member, div);
                }
            });
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function createDropdown(member, div) {
    
    // 创建删除图标
    const deleteButton = document.createElement('img');
    if (currentRole === 'ta'){
        deleteButton.src = '../../assets/icon/delete.png'; // 删除图标路径
        deleteButton.classList.add('delete-icon');
    }else {
        deleteButton.src = '../../assets/icon/add.png'; // 删除图标路径
        deleteButton.classList.add('add-icon');
    }

    // 判断当前用户是否为 'ta'
    if (currentRole === 'ta') {
        // 如果当前用户是 'ta'，只显示删除图标并直接绑定删除事件
        deleteButton.addEventListener('click', () => {
            //console.log('Delete button clicked for', member.email); // 正确显示电子邮件地址
            triggerDeleteModal(member.email, member.first_name, member.last_name); // 确保传递的是字符串值
        });
    } else {
        // 创建下拉菜单容器
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');
        dropdownMenu.style.display = 'none'; // 默认设置为隐藏

        // 创建 "Prompt/UnPrompt" 按钮
        const promptButton = document.createElement('button');
        promptButton.textContent = member.role.toLowerCase() === 'ta' ? 'UnPrompt' : 'Prompt';
        promptButton.addEventListener('click', () => {
            changeRole(member.email); // 只传递电子邮件地址
            dropdownMenu.style.display = 'none'; // 隐藏下拉菜单
        });

        // 创建 "删除成员" 按钮
        const deleteMemberButton = document.createElement('button');
        deleteMemberButton.textContent = 'Delete Member';
        deleteMemberButton.addEventListener('click', () => {
            triggerDeleteModal(member.email, member.first_name, member.last_name);
            dropdownMenu.style.display = 'none'; // 隐藏下拉菜单
        });

        // 将按钮添加到下拉菜单中
        dropdownMenu.appendChild(promptButton);
        dropdownMenu.appendChild(deleteMemberButton);

        // 为删除图标添加点击事件监听器
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        div.appendChild(dropdownMenu); // 将下拉菜单添加到成员信息元素中
    }

    div.appendChild(deleteButton); // 将删除图标添加到成员信息元素中
}


// 在文档上添加点击事件监听器，以关闭所有打开的下拉菜单
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
});

// 身份转变函数
function changeRole(email) {
    // 准备发送到服务器的数据
    const data = JSON.stringify({ email: email });
    console.log("current data is :",data);
    // 发送 POST 请求到服务器
    fetch('../../api/discussionAPI/convertMemberType.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => {
        // 检查响应是否成功
        if (!response.ok) {
            // 如果响应状态不是 OK，则尝试解析 JSON 错误消息
            return response.json().then(json => Promise.reject(json));
        }
        return response.json();
    })
    .then(result => {
        // 处理成功的响应
        if (result.state === 'success') {
            console.log('Role changed successfully');
            // 重新加载成员列表
            loadMembers();
        } else {
            // 处理服务器返回的失败状态
            console.error('Failed to change role:', result.error_message);
        }
    })
    .catch(error => {
        // 处理任何在 promise 链中抛出的错误
        if (error && error.error_message) {
            console.error('Error during role change:', error.error_message);
        } else {
            console.error('Error during role change:', error);
        }
    });
}



function setupDropdownsBasedOnRole(role) {
    // 检查角色并决定是否添加事件监听器
    if (role === 'admin' || role === 'professor' || role === 'ta') {
        // 为 "Text Channels" 标题添加点击事件监听器
        document.querySelector('.text-channels-header').addEventListener('click', function(event) {
            // 阻止事件冒泡
            event.stopPropagation();
            // 切换选项的显示状态
            var options = document.querySelector('.text-channel-options');
            options.style.display = options.style.display === 'block' ? 'none' : 'block';
        });

        // 为 "Members" 标题添加点击事件监听器
        document.querySelector('.members-header').addEventListener('click', function(event) {
            // 阻止事件冒泡
            event.stopPropagation();
            // 切换选项的显示状态
            var options = document.querySelector('.member-options');
            options.style.display = options.style.display === 'block' ? 'none' : 'block';
        });
    } else {
        // 如果角色不是 admin、professor 或 ta，可以在此添加逻辑来处理这种情况
        // 例如，隐藏或禁用某些元素
    }
}

// 触发删除成员的模态框
function triggerDeleteModal(member_email, first_name, last_name) {
    const modal = document.getElementById('delete-member-modal');
    modal.style.display = 'block';

    // 设置隐藏的输入框的值为成员的邮箱
    const emailInput = document.getElementById('email-to-delete'); // 假设这是模态框中的输入框
    emailInput.value = member_email; // 使用正确的参数

    // 在模态框中显示要删除的成员信息
    const memberInfo = document.getElementById('member-to-delete-info');
}













// 绑定重命名频道的点击事件
document.getElementById('rename-channel-option').addEventListener('click', function() {
    if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
        alert('You do not have permission to rename channels.');
        return;
    }
    enableChannelRename();
});

function enableChannelRename() {
    // 显示确认和取消按钮
    document.getElementById('rename-actions').style.display = 'block';

    // 获取“确认重命名”和“取消”按钮
    const confirmButton = document.getElementById('confirm-rename');
    const cancelButton = document.getElementById('cancel-rename');

    // 移除已存在的事件监听器
    confirmButton.removeEventListener('click', confirmRenameHandler);
    cancelButton.removeEventListener('click', cancelRenameHandler);

    // 重新添加事件监听器
    confirmButton.addEventListener('click', confirmRenameHandler);
    cancelButton.addEventListener('click', cancelRenameHandler);

    // 设置每个频道为编辑模式
    const channels = document.querySelectorAll('#channels-container .channel-name');
    channels.forEach(channel => {
        const oldName = channel.textContent.replace('# ', '').trim();
        channel.innerHTML = `<input type="text" value="${oldName}" class="rename-input" data-old-name="${oldName}">`;
        const input = channel.querySelector('.rename-input');
        
        input.focus();
    });
}

// “确认重命名”按钮的处理函数
function confirmRenameHandler() {
    let hasRenamed = false;
    let emptyNameFound = false;
    const channels = document.querySelectorAll('#channels-container .channel-name');
    channels.forEach(channel => {
        const input = channel.querySelector('.rename-input');
        if (input) {
            const newName = input.value.trim();
            const oldName = input.getAttribute('data-old-name');
            // Announcements频道无法被重命名
            if (oldName === "Announcements") {
                alert("The 'Announcements' channel cannot be renamed.");
                return;
            }
            // 检查新名称是否为空
            if (newName === '') {
                //lert('Channel name cannot be empty');
                emptyNameFound = true;
                return; // 跳出循环
            }
            //检查新名字和旧名字一样吗
            if (newName !== oldName) {
                confirmRename(oldName, newName);
                hasRenamed = true;
            }
        }
    });

    // 如果发现空名称或没有重命名，则取消重命名操作
    if (emptyNameFound) {
        alert('chennal name can not be empty.');
        cancelRenameHandler();
    }if (!hasRenamed) {
        //alert('You must rename at least one channel.');
        cancelRenameHandler();
    } else {
        loadChannels();
        document.getElementById('rename-actions').style.display = 'none';
    }
}

// “取消重命名”按钮的处理函数
function cancelRenameHandler() {
    loadChannels(); // 重新加载频道以取消编辑状态
    document.getElementById('rename-actions').style.display = 'none';
}


function confirmRename(oldName, newName, showAlert = false) {
    console.log('Renaming channel from:', oldName, 'to:', newName);
    fetch('../../api/discussionAPI/renameChannel.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldChannelName: oldName,
            newChannelName: newName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.state === 'success' && showAlert) {
            loadChannels();
        } else if (data.state !== 'success') {
            alert('Failed to rename channel: ' + data.error_message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// 模态相关的代码,添加和删除频道与人员
function setupChannelModalEvents() {
    // 获取模态框元素和关闭按钮
    var modal = document.getElementById("add-channel-modal");
    var span = document.getElementsByClassName("close")[0];
    console.log("print now role:",currentRole)
    // 绑定添加频道按钮的点击事件来显示模态框
    document.getElementById('add-channel-option').addEventListener('click', function() {
        if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
            alert('You do not have permission to create channels.');
            return;
        }
        modal.style.display = "block";
    });

    // 绑定关闭按钮的点击事件来隐藏模态框
    span.onclick = function() {
        modal.style.display = "none";
    }

    // 当点击模态框外部时也关闭模态框
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // 绑定表单提交事件来处理添加频道
    document.getElementById('add-channel-form').addEventListener('submit', function(event) {
        event.preventDefault(); // 防止表单提交刷新页面
        addNewChannel();
    });
}

function addNewChannel() {
    var modal = document.getElementById("add-channel-modal");
    var newChannelName = document.getElementById('new-channel-name').value.trim();
    var errorMessageDiv = document.getElementById('channel-add-error'); // 获取错误消息显示元素

    // 清除先前的错误消息
    errorMessageDiv.textContent = '';

    // 确保频道名称字段被填写
    if (!newChannelName) {
        errorMessageDiv.textContent = 'Channel name is required!';
        return;
    }

    // 发送 POST 请求到后端以添加新频道
    fetch('../../api/discussionAPI/addChannel.php', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newChannelName: newChannelName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.state === 'success') {
            loadChannels(); // 重新加载频道列表
            modal.style.display = "none"; // 关闭模态框
        } else {
            errorMessageDiv.textContent = 'Failed to add channel: ' + data.error_message; // 显示错误消息
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessageDiv.textContent = 'An error occurred while adding the channel.'; // 显示错误消息
    });
}


// 添加成员的关闭
function setupMemberModalEvents() {
    var modal = document.getElementById("add-member-modal");
    var span = modal.getElementsByClassName("close")[0];

    document.getElementById('add-member-option').addEventListener('click', function() {
        if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
            alert('You do not have permission to add members.');
            return;
        }
        modal.style.display = "block";
    });

    span.onclick = function() {
        modal.style.display = "none";
    }

    // 确保外部点击可以关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    document.getElementById('add-member-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addMember();
    });
}


// 添加频道的关闭
function setupChannelModalEvents() {
    var modal = document.getElementById("add-channel-modal");
    var span = modal.getElementsByClassName("close")[0];

    document.getElementById('add-channel-option').addEventListener('click', function() {
        if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
            alert('You do not have permission to create channels.');
            return;
        }
        modal.style.display = "block";
    });

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('add-channel-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addNewChannel();
    });
}




// 设置关闭按钮的点击事件
document.querySelectorAll('.modal .close').forEach(closeSpan => {
    closeSpan.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});
// 设置全局的点击事件，用于关闭模态框
window.addEventListener('click', function(event) {
    // 检查点击的目标是否是模态框的外部区域
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});
// 其他已存在的函数和事件监听器...



function setupModalEvents() {
    // 获取模态框元素和关闭按钮
    var modal = document.getElementById("add-member-modal");
    var span = document.getElementsByClassName("close")[0];

    // 绑定添加成员按钮的点击事件来显示模态框
    document.getElementById('add-member-option').addEventListener('click', function() {
        if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
            alert('You do not have permission to add members.');
            return;
        }
        modal.style.display = "block";
    });

    // 绑定关闭按钮的点击事件来隐藏模态框
    span.onclick = function() {
        modal.style.display = "none";
    }

    // 当点击模态框外部时也关闭模态框
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // 绑定表单提交事件来处理添加成员
    document.getElementById('add-member-form').addEventListener('submit', function(event) {
        event.preventDefault(); // 防止表单提交刷新页面
        addMember();
    });
}
// 添加成员
function addMember() {
    var modal = document.getElementById("add-member-modal");
    var email = document.getElementById('email').value.trim();
    var errorMessageDiv = document.getElementById('add-member-error'); // 获取错误消息显示元素
    errorMessageDiv.textContent = ''; // 清除先前的错误消息

    if (!email) {
        errorMessageDiv.textContent = 'Email is required!';
        return;
    }

    console.log('Sending email to server:', email);

    fetch('../../api/discussionAPI/addMember.php', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(json => Promise.reject(json));
        }
        return response.json();
    })
    .then(data => {
        if (data.state === 'success') {
            loadMembers(); // 重新加载成员列表
            modal.style.display = "none"; // 关闭模态框
        } else {
            errorMessageDiv.textContent = data.error_message; // 显示错误消息中的具体信息
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // 如果错误中有明确的错误消息，则显示它
        errorMessageDiv.textContent = error.error_message || 'An unknown error occurred.';
    });
}



// 设置删除频道选项的点击事件
document.getElementById('delete-channel-option').addEventListener('click', function() {
    if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
        alert('Insufficient permissions to delete');
        return;
    }
    // 显示删除频道的模态框
    document.getElementById('delete-channel-modal').style.display = 'block';
});

// 确认删除频道
function confirmDeleteChannel() {
    const channelName = document.getElementById('channel-to-delete').value.trim();
    const errorMessageDiv = document.getElementById('delete-channel-error'); // 获取错误消息显示元素
    errorMessageDiv.textContent = ''; // 清除先前的错误消息

    // 验证频道名称是否为空
    if (!channelName) {
        errorMessageDiv.textContent = 'Channel name cannot be empty';
        return;
    }

    // 特殊频道“Announcements”不能被删除
    if (channelName === "Announcements") {
        errorMessageDiv.textContent = "The 'Announcements' channel cannot be deleted.";
        return;
    }

    // 存储要删除的频道名称，并显示确认删除的模态框
    sessionStorage.setItem('channelToDelete', channelName);
    document.getElementById('confirm-delete-channel-modal').style.display = 'block';
}

// 执行删除频道的操作
function deleteChannel() {
    const channelName = sessionStorage.getItem('channelToDelete');
    const errorMessageDiv = document.getElementById('delete-channel-error'); // 获取错误消息显示元素
    errorMessageDiv.textContent = ''; // 清除先前的错误消息

    fetch('../../api/discussionAPI/deleteChannel.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelName: channelName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.state === 'success') {
            loadChannels(); // 重新加载频道列表
            closeAllDeleteModal();
        } else {
            errorMessageDiv.textContent = data.error_message || 'An error occurred while deleting the channel.';
            closeConfirmDeleteModal(); // 只关闭确认删除模态框
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessageDiv.textContent = error.message || 'An unexpected error occurred.';
        closeConfirmDeleteModal(); 
    });
}

// 关闭所有删除频道的模态框
function closeAllDeleteModal() {
    document.getElementById('confirm-delete-channel-modal').style.display = 'none';// 只关闭确认删除模态框
    document.getElementById('delete-channel-modal').style.display = 'none'; // 关闭删除频道的模态框
}

// 关闭所有删除频道的模态框
function closeConfirmDeleteModal() {
    document.getElementById('confirm-delete-channel-modal').style.display = 'none';// 只关闭确认删除模态框
}

// 关闭删除频道的模态框
document.querySelectorAll('.modal .close').forEach(closeSpan => {
    closeSpan.addEventListener('click', function() {
        this.parentElement.parentElement.style.display = 'none';
    });
});
// 关闭模态框时点击外部区域
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// 确认删除成员
function confirmDeleteMember() {
    const email = document.getElementById('email-to-delete').value.trim();
    if (!email) {
        alert('Email cannot be empty');
        return;
    }
    // 存储要删除的邮箱，并显示确认删除的模态框
    sessionStorage.setItem('emailToDelete', email);
    document.getElementById('confirm-delete-member-modal').style.display = 'block';
}
// 执行删除成员的操作
function deleteMember() {
    const email = sessionStorage.getItem('emailToDelete');
    fetch('../../api/discussionAPI/deleteMember.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.state === 'success') {
            //alert('Member deleted successfully');
            // 重新加载成员列表
            loadMembers();
        } else {
            alert('Failed to delete member: ' + data.error_message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    closeAllDeleteMemberModal()
}
// 关闭确认删除成员的模态框
function closeConfirmDeleteMemberModal() {
    document.getElementById('confirm-delete-member-modal').style.display = 'none';
}
// 关闭确认删除成员的模态框
function closeAllDeleteMemberModal() {
    document.getElementById('confirm-delete-member-modal').style.display = 'none';
    document.getElementById('delete-member-modal').style.display = 'none'; // 关闭删除成员的模态框
}
// 关闭删除成员的模态框
document.querySelectorAll('.modal .close').forEach(closeSpan => {
    closeSpan.addEventListener('click', function() {
        this.parentElement.parentElement.style.display = 'none';
    });
});
// 关闭模态框时点击外部区域
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};




// 触发删除帖子的操作（此函数需要在点击删除图标时被调用）
function confirmDeletePost(postId) {
    // 存储要删除的帖子ID
    sessionStorage.setItem('postToDelete', postId);
    // 显示确认删除的模态框
    document.getElementById('confirm-delete-post-modal').style.display = 'block';
    deletePost();
}

// 执行删除帖子的操作
function deletePost() {
    const postId = sessionStorage.getItem('postToDelete');
    fetch('../../api/discussionAPI/deletePost.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ post_id: postId }) // 确保这里的属性名与PHP脚本中的一致
    })
    .then(response => {
        // 检查响应状态
        console.log();
        if (!response.ok) {
            // 如果响应状态码不是2xx, 将响应文本转换为错误并抛出
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        if (data.state === 'success') {
            loadChannelMessages(currentChannel); // 重新加载帖子
        } else {
            // 如果state不是success，直接抛出错误
            throw new Error(data.error_message);
        }
    })
    .catch(error => {
        // 捕获任何在promise链中抛出的错误
        console.error('Error:', error);
        alert('An error occurred while deleting the post: ' + error.message);
    });
    closeConfirmDeletePostModal();
}

// 关闭确认删除帖子的模态框
function closeConfirmDeletePostModal() {
    document.getElementById('confirm-delete-post-modal').style.display = 'none';
}

// 额外：设置点击模态框外部区域也能关闭模态框
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

document.querySelector('.member-options p').addEventListener('click', function() {
    // 检查用户角色，如果不是 professor 或 ta，则显示权限不足的提示
    if (currentRole !== 'admin' && currentRole !== 'professor' && currentRole !== 'ta') {
        alert('Insufficient permissions');
        return; // 退出函数，不执行后续代码
    }

    // 显示模态框
    document.getElementById('invite-modal').style.display = 'block';

    // 发送请求获取邀请码
    fetch('../../api/discussionAPI/getInviteCode.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.state === 'success') {
                // 显示邀请码
                document.getElementById('invite-code').textContent = data.invite_code;
            } else {
                // 显示错误消息
                document.getElementById('invite-code').textContent = 'Error: ' + data.error_message;
            }
        })
        .catch(error => {
            // 显示错误消息
            document.getElementById('invite-code').textContent = 'Error: ' + error.message;
        });
});

// 为关闭按钮添加事件监听器
document.querySelector('#invite-modal .close').addEventListener('click', function() {
    document.getElementById('invite-modal').style.display = 'none';
});




function loadPinnedPosts() {
    fetch('../../api/discussionAPI/onloadGetPinPosts.php')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(pinnedPosts => {
        const container = document.getElementById('pinnedPostsDropdown');
        container.innerHTML = ''; // 清空现有内容

        if (pinnedPosts.length === 0) {
            container.innerHTML = '<p>No pinned posts yet.</p>';
            return;
        }

        // 遍历所有固定帖子并创建对应的 DOM 元素
        pinnedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('pinned-post'); // 应用您提供的样式

            const postContent = `
                <div>
                    <strong> From:"${post.channel_name}" ${post.first_name} ${post.last_name}</strong> ${new Date(post.post_time).toLocaleString()}
                </div>
                <div>
                    <p>${post.content}</p>
                </div>
            `;
            postElement.innerHTML = postContent;
            container.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error loading pinned posts:', error);
        document.getElementById('pinnedPostsDropdown').innerHTML = '<p>Error loading pinned posts.</p>';
    });
}


function toggleSidebar() {
    var sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    // 汉堡菜单的显示/隐藏也需要在这里控制
    var hamburger = document.querySelector('.hamburger-menu');
    if (sidebar.classList.contains('active')) {
        hamburger.style.top = "0px";
        hamburger.style.left = "250px"; // 如果sidebar打开了，移动汉堡图标
    } else {
        hamburger.style.top = "70px";
        hamburger.style.left = "0px"; // 如果sidebar关闭了，重置汉堡图标位置
    }
}

// 监听窗口大小变化
window.addEventListener('resize', function() {
    var sidebar = document.querySelector('.sidebar');
    var hamburger = document.querySelector('.hamburger-menu');
    if (window.innerWidth > 1260) {
        // 如果屏幕宽度大于1260px，则移除active类，重置样式
        sidebar.classList.remove('active');
        hamburger.style.top = "70px"; // 重置汉堡图标初始位置
        hamburger.style.left = "0px"; // 重置汉堡图标位置
    }
});