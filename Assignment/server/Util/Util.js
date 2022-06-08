export let checkPasswordFormat = pass => {
    let rPass = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/
    return rPass.test(pass);
}

export let checkEmailFormat = email => {
    let rEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    return rEmail.test(email);
}

export let checkdisplayName = name => {
    if (name.length < 100) return true;
}

export let checkbirthDate = date => {
    let presentDate = new Date()
    let inputDate = new Date(date)
    if (inputDate < presentDate) return true;
}

export let formatDate = date => {
    let inputDate = new Date(date)
    return inputDate.getFullYear() + "-" + ("0" + (inputDate.getMonth() + 1)).slice(-2) + "-" + ("0" + inputDate.getDate()).slice(-2)

}