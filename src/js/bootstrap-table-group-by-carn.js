/**
 * @author: Cesar A. Nieto R.
**/

var $ = window.jQuery

$.extend($.fn.bootstrapTable.defaults, {
  groupByPersonal: false,
  groupById: '',
  groupByTab: null
})

// it only does '%s', and return '' when arguments are undefined
const sprint = function (str) {
  const args = arguments
  let flag = true
  let i = 1

  str = str.replace(/%s/g, () => {
    const arg = args[i++]

    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// Contabiliza las coincidencias
// j = posicion en el arreglo,  value = el valor a revisar, data = arreglo a recorrer, id = key el objeto a tomar
const counRegex = function (i, value, data, id, ani) {
  var anidacion = ani != null ? ani+1 : 0
  var init = i != null ? i : 0
  var count = 0

  for (var j = init; j < data.length; j++) {
    if (anidacion == 0) {
      returnCount = counRegex(j+1, data[j], data, id, anidacion)
      if (returnCount > 0) {
        data[j]['checkValue'] = true
      } else {
        data[j]['checkValue'] = false
      }
    }

    if (anidacion == 1) {
      var myRe = new RegExp('^' + value[id] + '.{2}$','gm')
      var testRe = myRe.test(data[j][id])
      if (testRe) {
        data[j][id + '_PARENT'] = value[id]
        count += 1
      }
    }
  }

  if (anidacion == 1) {
    return count
  }
  return data
}

$.BootstrapTable = class extends $.BootstrapTable {
  scrollTo () {
    if (this.options.groupByPersonal && this.options.groupById !== '') {
      var that = this

      if (this.$body !== undefined) {
        // var data = this.data
        var id = this.options.groupById
        var data = counRegex(null, null, this.data, id, null)

        for (var i in data) {
          var html = []

          if ((data[i].ID_NIVEL < 1 && data[i].checkValue) || data[i].checkValue) {
            html.push('<button class="bbva-icon bbva-icon__2_021_contract"></button>')
            this.$body.find(sprint('tr[data-index="%s"]', i)).attr('data-id', data[i][id]).attr('data-id-parent', data[i][id + '_PARENT']).addClass('groupBy expanded')
          } else {
            this.$body.find(sprint('tr[data-index="%s"]', i)).attr('data-id', data[i][id]).attr('data-id-parent', data[i][id + '_PARENT'])
          }

          this.$body.find(sprint('tr[data-index="%s"] > td:first', i)).empty().append(html.join(''))
          var px = this.$body.find(sprint('tr[data-index="%s"] > td:eq(1)', i)).css('padding-left')

          if(this.options.groupByTab !== null) {
            px = parseInt(px)+(data[i][this.options.groupByTab]*13)
            px = px + 'px'
            this.$body.find(sprint('tr[data-index="%s"] > td:eq(1)', i)).css('padding-left', px)
          }
        }
      }

      this.$container.off('click', '.groupBy')
        .on('click', '.groupBy', function () {
          var _this = that.$body.parents('div.fixed-table-container')
          var _tr = _this.find(`tr[data-id=${$(this).data('id')}]`)
          _tr.toggleClass('expanded', 'collapsed')
          _tr.toggleClass('collapsed', 'expanded')
          _tr.find('td > button').toggleClass('bbva-icon__2_021_contract', 'bbva-icon__2_020_expand')
          _tr.find('td > button').toggleClass('bbva-icon__2_020_expand', 'bbva-icon__2_021_contract')
          _this.find(`tr[data-id-parent=${$(this).closest('tr').data('id')}]`).toggleClass('hidden')
          _this.find(`tr[data-id-parent=${$(this).closest('tr').data('id')}].groupBy.expanded`).click()
        })

      this.$container.off('click', '[name="btSelectGroup"]')
        .on('click', '[name="btSelectGroup"]', function (event) {
          event.stopImmediatePropagation()

          const self = $(this)
          const checked = self.prop('checked')
          that[checked ? 'checkGroup' : 'uncheckGroup']($(this).closest('tr').data('group-index'))
        })
    }
    super.scrollTo()
  }
}
