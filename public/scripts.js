const calculateResults = (url) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resolveInput())
  }
  document.getElementById('inputJsonContent').innerHTML = JSON.stringify(resolveInput(), null, 2)
  fetch(url, config).then(async (response) => {
    const result = await response.json()
    const container = document.getElementById('resultsContainer')
    document.getElementById('outputJsonContent').innerHTML = JSON.stringify(result, null, 2)
    if (response.ok) {
      if (Array.isArray(result)) {
        handleResult(container, result)
      }
    } else {
      appendErrors(container, result.errors)
    }
  })
}

const handleResult = (container, result) => {
  const resultElements = result.map(r => {
    const element = document.createElement('div')
    let output = {
      'range mode': r.range.mode,
      'range min': r.range.min,
      'range max': r.range.max,
      'range K': r.range.coverageFactor,
    }
    const rangeElement = document.createElement('div')
    rangeElement.className = 'rangeValues'
    rangeElement.innerHTML = Object.keys(output).map(k => `${k}: ${output[k]}`).join("<br/>")
    element.appendChild(rangeElement)
    if (r.uRw) {
      const resultElement = document.createElement('div')
      const output = {
        'uRw': r.uRw,
        'ub': r.ub,
        'uncertainty': r.uncertainty,
        'expanded uncertainty': r.expandedUncertainty
      }
      resultElement.innerHTML = Object.keys(output).map(k => `${k}: ${output[k]}`).join("<br/>")
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
  let data = parseData(document.getElementById('measurementData').value)
  let references = Array.from(document.getElementsByClassName('referenceContainer')).map(r => {
    return {
      value: getFloatValue(r, 'referenceValue'),
      uncertainty: getFloatValue(r, 'referenceUncertainty'),
      data: parseReferenceData(r.querySelectorAll('[name=referenceData]')[0].value)
    }
  })
  let ranges = Array.from(document.getElementsByClassName('rangeContainer')).map(r => {
    return {
      mode: r.querySelectorAll('[name=rangeMode]')[0].value,
      min: getFloatValue(r, 'rangeMin'),
      max: getFloatValue(r, 'rangeMax'),
      coverageFactor: getFloatValue(r, 'rangeCoverageFactor')
    }
  })
  return {
    data,
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
    data.push(row.split(/[ \t]+/).map(d => parseFloat(d)).filter(d => d !== null))
  }
  return data.filter(d => d !== null)
}

const parseReferenceData = (value) => {
  const data = []
  const rows = value.split("\n")
  for (const row of rows) {
    data.push(parseFloat(row))
  }
  return data.filter(d => d !== null)
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
  const div = parent.getElementsByTagName('div')[0]
  const clone = div.cloneNode(true)
  const button = clone.getElementsByClassName('removeButton')[0]
  button.style.display = 'block'
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
