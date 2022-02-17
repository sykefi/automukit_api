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
      'Mode': r.range.mode,
      'Min value': r.range.min,
      'Max value': r.range.max,
      'Coverage factor K': r.range.coverageFactor,
      'Replicate samples min': r.range.replicateSamplesMin,
      'Control samples min': r.range.controlSamplesMin
    }
    const rangeElement = document.createElement('div')
    rangeElement.className = 'rangeValues'
    rangeElement.innerHTML = '<b>Range</b><br/>' +
        Object.keys(output).map(k => `${k}: ${output[k]}`).join("<br/>")
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
  let replicateSamples = parseData(document.getElementById('measurementData').value)
  let references = Array.from(document.getElementsByClassName('referenceContainer')).map(r => {
    return {
      value: getFloatValue(r, 'referenceValue'),
      uncertainty: getFloatValue(r, 'referenceUncertainty'),
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
