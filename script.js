const addBtns = document.querySelectorAll('.add-btn:not(.solid)')
const saveItemBtns = document.querySelectorAll('.solid')
const addItemContainers = document.querySelectorAll('.add-container')
const addItems = document.querySelectorAll('.add-item')
// Списки
const listColumns = document.querySelectorAll('.drag-item-list')
const backlogList = document.getElementById('backlog-list')
const progressList = document.getElementById('progress-list')
const completeList = document.getElementById('complete-list')
const onHoldList = document.getElementById('on-hold-list')

let updatedOnLoad = false

// Массивы с данными для каждого вида списка
let backlogListArray = []
let progressListArray = []
let completeListArray = []
let onHoldListArray = []
let listArrays = []
// Переменные для Drag and Drop
let draggedItem
let dragging = false 
let currentColumn

// Получаем данные массивов из LocalStorage, если они есть
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems)
    progressListArray = JSON.parse(localStorage.progressItems)
    completeListArray = JSON.parse(localStorage.completeItems)
    onHoldListArray = JSON.parse(localStorage.onHoldItems)
  } else {
    backlogListArray = ['Закончить проект', 'Съездить в автосервис']
    progressListArray = ['Разбить задачу на подзадачи', 'Оплатить счета']
    completeListArray = ['Встреча с родными', 'Тренировка']
    onHoldListArray = ['Посещение занятий', 'Отдых']
  }
}


// Кладём данные массивов в LocalStorage
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray]
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold']

  arrayNames.forEach((arrName, index) => {
    localStorage.setItem(`${arrName}Items`, JSON.stringify(listArrays[index]))
  })
}

// Фильтр массива для удаления пустых значений
function filterArray(array) {
  const filteredArray = array.filter(item => item !== null)
  return filteredArray
}

// Cоздаём DOM-элементы для каждого элемента списка
function createItemEl(columnEl, column, item, index) {
  // Элемент списка
  const listEl = document.createElement('li')
  listEl.classList.add('drag-item')
  listEl.textContent = item
  listEl.draggable = true
  listEl.contentEditable = true
  listEl.setAttribute('ondragstart', 'drag(event)')
  listEl.id = index
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`)

  columnEl.appendChild(listEl)
}


function updateDOM() {
  // // Запускаем getSavedColumns один раз, обновляя Local Storage 
  if (!updatedOnLoad) {
  getSavedColumns()
  }
  
  backlogList.textContent = ''
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogList, 0, backlogItem, index)
  })
  backlogListArray = filterArray(backlogListArray)
  
  progressList.textContent = ''
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressList, 1, progressItem, index)
  })
  progressListArray = filterArray(progressListArray)
  
  completeList.textContent = ''
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeList, 2, completeItem, index)
  })
  completeListArray = filterArray(completeListArray)
  
  onHoldList.textContent = ''
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldList, 3, onHoldItem, index)
  })
  onHoldListArray = filterArray(onHoldListArray)
  
  updatedOnLoad = true
  updateSavedColumns()
}

// Удаляем или обновляем задачу в массиве
function updateItem(id, column) {
  const selectedArray = listArrays[column]
  const selectedColumnEl = listColumns[column].children

  if (!dragging) {
    if (!selectedColumnEl[id].textContent) {
      delete selectedArray[id]
    } else {
      selectedArray[id] = selectedColumnEl[id].textContent
    }
    updateDOM()
  }
}

// Добавляем в столбец список, Сброс поля с текстом
function addTextToColumn(column) {
  const itemText = addItems[column].textContent.trim()
  const selectedArray = listArrays[column]
  if (itemText !== '') {
    selectedArray.push(itemText)
  }
  addItems[column].textContent = ''
  updateDOM()
}

// Показываем поле инпута для добавления задачи
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden'
  saveItemBtns[column].style.display = 'flex'
  addItemContainers[column].style.display = 'flex'
}

//Скрываем поле инпута
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible'
  saveItemBtns[column].style.display = 'none'
  addItemContainers[column].style.display = 'none'
  addTextToColumn(column)
}

// Сохраняем в массивы Drag and Drop элементы
function rebuildArrays() {
  backlogListArray = Array.from(backlogList.children).map(i => i.textContent)
  progressListArray = Array.from(progressList.children).map(i => i.textContent)
  completeListArray = Array.from(completeList.children).map(i => i.textContent)
  onHoldListArray = Array.from(onHoldList.children).map(i => i.textContent)

  updateDOM()
}

// Когда начинаем перетаскивание
function drag(e) {
  draggedItem = e.target
  dragging = true
}

// Позволяем столбцам принимать перетаскиваемые элементы 
function allowDrop(e) {
  e.preventDefault()
}

// Когда перетаскивыемый элемент входит в зону столбца
function dragEnter(column) {
  listColumns[column].classList.add('over')
  currentColumn = column
}

// Кладем элемент в столбец
function drop(e) {
  e.preventDefault()

  listColumns.forEach(column => {
    column.classList.remove('over')
  })
  const parent = listColumns[currentColumn]
  parent.appendChild(draggedItem)
  dragging = false
  rebuildArrays()
}

updateDOM()