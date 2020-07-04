require('bootstrap')

const url = window.location.origin

function template(template) {
  return document.getElementById(template + '-template')
}

function render(component) {
  let app = document.getElementById('app')
  app.innerHTML = ''
  return app.append(component)
}

function parseFormData(formData) {
  let data = {}
  for (let entry of formData.entries()) {
    data[entry[0]] = entry[1]
  }
  return data;
}

function viewLoginForm() {
  const instance = template('login-form')
  const form = instance.querySelector('login-form')
  form.onsubmit = (form) => {
    form.preventDefault()
    handleLogin(form)
  }
  render(instance)
}

function handleLogin(form) {
  const formData = parseFormData(new FormData(form))
  fetch(url + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.log(err))
}

function viewRegistrationForm() {
  const instance = template('register-form')
  const form = instance.querySelector('registration-form')
  form.onsubmit = (form) => {
    form.preventDefault()
    handleRegistration(form)
  }
  render(instance)
}

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
    .then(json => console.log(json))
    .catch(err => console.log(err))
}

async function viewCharacters() {
  //
}

async function viewCharacterForm(character_id) {
  //
}