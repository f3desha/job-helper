// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const ipcRenderer = require('electron').ipcRenderer;
const linkedinModule = require('./modules/linkedin-helper/Linkedin');
let linkedinToken = null;

/**LISTENERS START*******/
ipcRenderer.on('profile-update', (event, token) => {
    linkedinToken = token;
    const Linkedin = new linkedinModule();
    Linkedin.oauthProfileCaller(token)
    .then((data) => {
        let imageUrl = data.profilePicture["displayImage~"].elements[0].identifiers[0].identifier;
        let send = {
            user_id: data.id,
            url: imageUrl,
            firstName: data.localizedFirstName,
            lastName: data.localizedLastName,
            auth_token: token
        };
        ipcRenderer.send('user-init', send);
    })
    .catch((reject) => {
      console.log(reject);
    });
})

ipcRenderer.on('avatar-uploaded', (event, result) => {
    let avatarBlock = document.getElementById('avatar-block');
    avatarBlock.innerHTML = `<div class="avatar-holder" id="avatar-holder">
    <span class="name-holder">${result.firstName} ${result.lastName}</span>
    <span id="avatar-span"><img class="avatar" id="avatar" src="./files/images/avatars/${result.user_id}.jpg" alt=""></span></div>`;
});
/********LISTENERS END**********/