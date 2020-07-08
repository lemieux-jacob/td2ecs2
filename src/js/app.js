require('bootstrap')

const url = window.location.origin

// User Controls
const loginBtn = document.getElementById('loginBtn')
const registerBtn = document.getElementById('registerBtn')
const logoutBtn = document.getElementById('logoutBtn')

// Enable User Controls
loginBtn.onclick = (e) => {
  viewLoginForm()
}
registerBtn.onclick = (e) => {
  viewRegistrationForm()
}
logoutBtn.onclick = (e) => {
  handleLogout()
}

start() // Start the Application

// Main
async function start() {
  const status = await fetch(url + '/users/status')
    .then(res => res.json())
    .then(user => {
      if (user.status == 'logged out') {
        return false
      }
      return true
    })
    .catch(err => {
      console.log(err.message)
      return false
    })

  // User is Logged Out
  if (status == false) {
    show(loginBtn)
    show(registerBtn)
    hide(logoutBtn)

    return app.innerHTML = `<p>Welcome to my Tiny Dungeon 2E Character Sheet App</p>`
  }

  // User is Logged In
  hide(loginBtn)
  hide(registerBtn)
  show(logoutBtn)

  // Get Characters for User
  viewCharacters()
}

// Load Game Data
async function getData() {
  return await fetch(url + '/json/app.json')
    .then(res => res.json())
    .then(json => json)
    .catch(err => console.log(err.message))
}

// Create Instance of Template
function template(name) {
  const template = document.getElementById(name + '-template')
  return document.importNode(template.content, true)
}

// Show an Element
function show(e) {
  if (e.classList.contains('hidden')) {
    e.classList.remove('hidden')
  }
}

// Hide an Element
function hide(e) {
  if (!e.classList.contains('hidden')) {
    e.classList.add('hidden')
  }
}

// Clear the Application Space
function clearApp() {
  let app = document.getElementById('app')
  app.innerHTML = ''
}

// Render a Component
function render(component) {
  let app = document.getElementById('app')
  return app.append(component)
}

// Parse Form Data for Transmission
function parseFormData(formData) {
  let data = {}
  let traits = []
  for (let entry of formData.entries()) {
    if (entry[0] == 'traits[]') {
      traits.push(entry[1])
    } else {
      data[entry[0]] = entry[1]
    }
  }
  if (traits.length > 0) {
    data.traits = traits
  }
  return data
}

// Login Form
function viewLoginForm() {
  const instance = template('login-form')
  const form = instance.querySelector('#login-form')
  form.onsubmit = (form) => {
    form.preventDefault()
    handleLogin()
  }
  clearApp()
  render(instance)
}

// Login Action
function handleLogin() {
  const form = document.getElementById('login-form')
  const formData = parseFormData(new FormData(form))
  fetch(url + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(json => start())
    .catch(err => console.error(err.message))
}

// Registration Form
function viewRegistrationForm() {
  const instance = template('registration-form')
  const form = instance.querySelector('#registration-form')
  form.onsubmit = (e) => {
    e.preventDefault()
    handleRegistration(e.target)
  }
  clearApp()
  render(instance)
}

// Registration Action
function handleRegistration(form) {
  const formData = parseFormData(new FormData(form))
  fetch(url + '/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(user => {
      console.log(user)
      viewLoginForm()
    })
    .catch(err => console.log(err.message))
}

// Logout Action
function handleLogout() {
  fetch(url + '/users/logout')
    .then(json => start())
    .catch(err => console.log(err.message))
}

// View Characters for current User
function viewCharacters() {
  fetch(url + '/characters', {
      'Content-Type': 'application/json'
    })
    .then(async res => {
      if (res.status == 401) {
        return console.log('Unauthorized')
      }
      const characters = await res.json()

      clearApp()

      if (characters.length < 1) {
        let div = document.createElement('div')
        div.className = 'alert alert danger my-2'
        div.innerText = 'No Characters Yet'
        return app.appendChild(div)
      }

      characters.forEach(character => {
        let instance = template('character-listview')
        let descriptor = `${character.name}, the ${character.heritage}`
        instance.querySelector('.descriptor').innerText = descriptor
        // Enable View/Edit/Delete Buttons
        enableBtns(instance, character._id)
        render(instance)
      })
    })
    .catch(err => console.error(err.message))
}

// View Character Form (Create/Edit)
async function viewCharacterForm(character_id) {
  const data = await getData()
  const instance = template('character-form')
  const form = instance.querySelector('#character-form')
  const traits = instance.querySelector('#traits')

  if (typeof character_id !== 'undefined') {
    let character
    // Get Character from API
    try {
      const res = await fetch(`${url}/characters/${character_id}`)
      character = await res.json()
    } catch (err) {
      return console.err(err.message)
    }

    // Populate Fields
    instance.querySelector('#name').value = character.name
    instance.querySelector('#heritage').value = character.heritage
    instance.querySelector('#proficiency').value = character.proficiency
    instance.querySelector('#mastery').value = character.mastery
    instance.querySelector('#cid').value = character.character_id

    // Populate Traits
    character.traits.forEach(trait => {
      let input = document.createElement('input')
      input.className = 'form-control'
      input.name = 'traits[]'
      input.value = trait
      traits.appendChild(input)
    })

    const method = document.createElement('input')
    method.type = 'hidden'
    method.name = 'method'
    method.value = 'PATCH'
    form.appendChild(method)
  }

  const heritage = instance.querySelector('#heritage')

  heritage.onchange = async (e) => {
    let input = traits.firstChild;
    input.value = data.heritages[heritage.value].trait
  }

  form.onsubmit = (e) => {
    e.preventDefault()
    saveCharacter(form, character_id || null)
  }
  clearApp()
  render(instance)
}

// Create or Update a Character via the API
function saveCharacter(form, character_id) {
  const formData = parseFormData(new FormData(form))
  fetch(url + '/characters/' + character_id || '', {
      method: formData.method || 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(character => {
      viewCharacterSheet(character._id)
    })
    .catch(err => console.log(err.message))
}

// Delete a Character via the API
function deleteCharacter(character_id) {
  fetch(`${url}/characters/${character_id}`, {
      method: 'DELETE'
    })
    .then(res => viewCharacters())
    .catch(err => console.log(err.message))
}

// View Character Sheet
async function viewCharacterSheet(character_id) {
  const instance = template('character-sheet')
  let character
  // Get Character from API
  try {
    const response = await fetch(`${url}/characters/${character_id}`)
    character = await response.json()
  } catch (err) {
    return console.err(err.message)
  }

  // Populate Sheet
  instance.querySelector('#name').innerText = character.name
  instance.querySelector('#heritage').innerText = character.heritage
  instance.querySelector('#proficiency').innerText = character.proficiency
  instance.querySelector('#mastery').innerText = character.mastery

  const traitsEl = instance.querySelector('#traits')

  character.traits.forEach((trait) => {
    let li = document.createElement('li')
    li.className = 'trait list-group-item'
    li.innerText = trait
    traitsEl.appendChild(li)
  })
  enableBtns(instance, character_id)

  clearApp()
  render(instance)
}

// Enable Character Controls (View, Edit, Delete)
function enableBtns(instance, character_id) {
  if (instance.querySelector('.vcsBtn')) {
    instance.querySelector('.vcsBtn').onclick = function (e) {
      viewCharacterSheet(character_id)
    }
  }
  instance.querySelector('.ecBtn').onclick = function (e) {
    viewCharacterForm(character_id)
  }
  instance.querySelector('.dcBtn').onclick = function (e) {
    deleteCharacter(character_id)
  }
}

// Parse Cookie String into Array
function getCookies() {
  let cookies = {}
  let cookiesArr = document.cookie.split(';')
  cookiesArr.forEach(c => {
    let keypair = c.split('=')
    cookies[keypair[0]] = keypair[1]
  })
  return cookies
}