const calculateResults = (url) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resolveInput())
  }
  document.getElementById('inputJsonContent').innerHTML = JSON.stringify(resolveInput(), null, 2)
  const container = document.getElementById('resultsContainer')
  container.innerHTML = 'Loading...'
  fetch(url, config).then(async (response) => {
    const result = await response.json()
    document.getElementById('outputJsonContent').innerHTML = JSON.stringify(result, null, 2)
    if (response.ok) {
      if (Array.isArray(result)) {
        handleResult(container, result)
      }
    } else {
      container.innerHTML = ''
      appendErrors(container, result.errors)
    }
  })
}

const handleResult = (container, result) => {
  const resultElements = result.map(r => {
    const element = document.createElement('div')
    let output = {
      'Calculation mode': r.range.mode,
      'Minimum value': r.range.min,
      'Maximum value': r.range.max,
      'Coverage factor k': r.range.coverageFactor,
      'Minimum amount of replicate series': r.range.replicateSamplesMin,
      'Minimum amount of CRM results': r.range.controlSamplesMin
    }
    const rangeElement = document.createElement('div')
    rangeElement.className = 'rangeValues'
    rangeElement.innerHTML = '<b>Range</b><br/>' +
        Object.keys(output).map(k => `${k}: ${output[k]}`).join("<br/>")
    element.appendChild(rangeElement)
    if (r.uRw) {
      const resultElement = document.createElement('div')
      const output = {
        'Within-laboratory reproducibility, u(Rw)': r.uRw,
        'Method and laboratory bias, u(bias)': r.ub,
        'Combined standard uncertainty, uc': r.uncertainty,
        'Expanded uncertainty, U': r.expandedUncertainty
      }
      const postfix = r.range.mode === 'relative' ? ' %' : ''
      resultElement.innerHTML = Object.keys(output).map(k => `${k}: ${output[k]}${postfix}`).join("<br/>")
      resultElement.className = 'resultValues'
      element.appendChild(resultElement)
    }
    element.className = 'result'
    appendErrors(element, r.errors)
    return element
  })
  container.innerHTML = ''
  container.append(...resultElements)
}

const resolveInput = () => {
  let replicateSamples = parseData(document.getElementById('measurementData').value)
  let references = Array.from(document.getElementsByClassName('referenceContainer')).map(r => {
    return {
      value: getFloatValue(r, 'referenceValue'),
      uncertainty: resolveReferenceUncertainty(r),
      controlSamples: parseReferenceData(r.querySelectorAll('[name=referenceData]')[0].value)
    }
  })
  let ranges = Array.from(document.getElementsByClassName('rangeContainer')).map(r => {
    return {
      mode: r.querySelectorAll('[name=rangeMode]')[0].value,
      min: getFloatValue(r, 'rangeMin'),
      max: getFloatValue(r, 'rangeMax'),
      coverageFactor: getFloatValue(r, 'rangeCoverageFactor'),
      replicateSamplesMin: getFloatValue(r, 'replicateSamplesMin'),
      controlSamplesMin: getFloatValue(r, 'controlSamplesMin')
    }
  })
  return {
    replicateSamples,
    references,
    ranges
  }
}

const getFloatValue = (parent, childName) => {
  return parseFloat(parent.querySelectorAll(`[name=${childName}]`)[0].value)
}

const parseData = (value) => {
  const data = []
  const rows = value.split("\n")
  for (const row of rows) {
    data.push(row.split(/[ \t]+/).map(d => parseFloat(d)).filter(d => !isNaN(d)))
  }
  return data.filter(d => d.length > 0)
}

const parseReferenceData = (value) => {
  const data = []
  const rows = value.split("\n")
  for (const row of rows) {
    data.push(parseFloat(row))
  }
  return data.filter(d => !isNaN(d))
}

const appendErrors = (container, errors) => {
  if (!Array.isArray(errors)) {
    return
  }
  const errorElements = errors.map(error => {
    const element = document.createElement('div')
    element.innerHTML = error
    element.className = 'error'
    return element
  })
  container.append(...errorElements)
}

const formatTextareaData = (event) => {
  window.setTimeout(() => {
    const data = event.target.value
    event.target.value = data.replaceAll(',', '.')
  }, 100)
}

const addElement = (element) => {
  const parent = element.parentElement
  const div = parent.getElementsByClassName('subBlock')[0]
  const clone = div.cloneNode(true)
  let elements = clone.getElementsByClassName('popuptext')
  for (const element of elements) {
    element.id = null
  }
  elements = clone.getElementsByClassName('helpToggle')
  for (const element of elements) {
    element.style.display = 'none'
  }
  const button = clone.getElementsByClassName('removeButton')[0]
  if (button) {
    button.style.display = 'block'
  }
  element.insertAdjacentElement('beforebegin', clone)
}

const removeElement = (element) => {
  const parent = element.parentElement
  parent.parentElement.removeChild(parent)
}

const toggleJSON = () => {
  const input = document.getElementById('inputJson')
  const output = document.getElementById('outputJson')
  input.style.display = input.style.display === 'block' ? 'none' : 'block'
  output.style.display = output.style.display === 'block' ? 'none' : 'block'
}

const togglePopup = (event, id) => {
  const elements = document.getElementsByClassName('popuptext')
  for (const element of elements) {
    if (element.id !== id) {
      element.classList.remove('show')
    }
  }
  const element = document.getElementById(id)
  element.classList.toggle('show')
  event.stopPropagation()
  event.preventDefault()
}

const closePopups = () => {
  const elements = document.getElementsByClassName('popuptext')
  for (const element of elements) {
    element.classList.remove('show')
  }
}

const resolveReferenceUncertainty = (parent) => {
  const value = getFloatValue(parent, 'referenceValue')
  const uncertainty = getFloatValue(parent, 'referenceUncertainty')
  const type = parent.querySelectorAll('[name=referenceUncertaintyType]')[0].value
  if (type === 'relative') {
    return value * (uncertainty / 100)
  } else {
    return uncertainty
  }
}
