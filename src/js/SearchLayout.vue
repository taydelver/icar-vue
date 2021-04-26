<template>
  <div class="wbctz-ymm-search">
    <div class="wbctz-ymm-search__header">
      <div v-if="results.length" class="wbctz-ymm-search__searching-for">
          <div class="mb-1">Results for:</div>
          <div class="relative">
            <span v-if="!form.year && yearMinMax.min && yearMinMax" class="wbctz-ymm-search__searching-for-item ymm-searching-for--year">{{yearMinMax.min}} - {{yearMinMax.max}}</span>
            <span v-if="form.year" class="wbctz-ymm-search__searching-for-item ymm-searching-for--year">{{form.year}}</span>
            <span v-if="form.make" class="wbctz-ymm-search__searching-for-item ymm-searching-for--make">{{form.make}}</span>
            <span v-if="form.model" class="wbctz-ymm-search__searching-for-item ymm-searching-for--model">{{form.model}}</span>
            <!-- <span class="wbctz-ymm-search__clear-btn"><i class="fa fa-times-circle"></i></span> -->
          </div>
      </div>
      <div v-if="results && metaData.total > metaData.perPage" class="wbctz-ymm-search__pagination is-top">
        <paginator @change="onPageChange" :current="currentPage" :results-text="resultsFromTo" :total="metaData.total" :last="metaData.last" :per-page="metaData.perPage"/>
      </div>
    </div>
      
    <div v-if="initialized" class="wbctz-ymm-search__dropdowns">
      <div class="wbctz-input-row">
        <label>Make:</label>
        <select @change="onMakeChange" v-model="form.make" class="input--select">
          <option :value="null">--Select Make--</option>
          <option v-for="(make, key) in makes" :key="key" :value="make">{{make}}</option>
        </select>
      </div>
      <div class="wbctz-input-row">
        <label>Model:</label>
        <select @change="onModelChange" :disabled="!form.make" v-model="form.model" class="input--select">
          <option :value="null">--Select Model--</option>
          <option v-for="(model, key) in models" :key="key" :value="model">{{model}}</option>
        </select>
      </div>
      <div class="wbctz-input-row">
        <label>Year:</label>
        <select @change="onYearChange" placeholder="SELECT YEAR" :disabled="!form.make && !form.model" v-model="form.year" class="input--select">
          <option :value="null">--Select Year--</option>
          <option v-for="(year, key) in years" :key="key" :value="year">{{year}}</option>
        </select>
      </div>
    </div>
    
    <div class="wbctz-ymm-search__results">
      <div v-if="loading" class="wbctz-ymm-search__loader-container">
        <loader/>
      </div>
      <div class="text-center wbctz-ymm-search__empty-container" v-if="!results.length && showNoResults">
        <div class="wbctz-ymm-search__no-results">No results</div>
        <div class="search-terms">No results for <strong>{{form.year}} {{form.make}} {{form.model}}</strong></div>
      </div>
      <div v-if="!pushState" class="text-center wbctz-ymm-search__empty-container">
        <div class="wbctz-ymm-search__no-results">
          Please select a Make, Model and/or Year
        </div>
      </div>
      <div v-if="results.length && !loading">
        <!-- <div v-for="result in results" :key="result.id">{{result.title}}</div> -->
        <table class="table">
            <thead>
                <tr>
                    <th data-col="1" scope="col">Make</th>
                    <th class="is-sortable" @click="handleSort('model')" data-col="2" scope="col">
                      Model
                      <span>
                        <i :class="{active: sortableIsActive('model', 'desc')}" class="fa fa-long-arrow-down"></i>
                        <i :class="{active: sortableIsActive('model', 'asc')}" class="fa fa-long-arrow-up"></i>
                      </span>
                    </th>
                    <th class="is-sortable" @click="handleSort('year')" data-col="3" scope="col">
                      Year
                      <span>
                        <i :class="{active: sortableIsActive('year', 'desc')}" class="fa fa-long-arrow-down"></i>
                        <i :class="{active: sortableIsActive('year', 'asc')}" class="fa fa-long-arrow-up"></i>
                      </span>
                    </th>
                    <th data-col="4" scop="col">Name</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="result in results" :key="result.id">
                    <td>{{result.make}}</td>
                    <td>{{result.model}}</td>
                    <td>{{result.year}}</td>
                    <td>
                      <a :href="generateUrl(result)">{{result.title}}</a>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
    <div v-if="results && metaData.total > metaData.perPage" class="wbctz-ymm-search__pagination is-bottom">
      <paginator @change="onPageChange" :current="currentPage" :results-text="resultsFromTo" :total="metaData.total" :last="metaData.last" :per-page="metaData.perPage"/>
    </div>
  </div>
</template>

<script>
import Paginator from './componenets/Paginator'
import Loader from './componenets/Loader'
export default {
  components: {Paginator, Loader},
  props: ['catId'],
  data() {
    return {
      urlBase: 'https://icarlaravel.webcitzdevelopment.com',
      loading: true,
      initialized: false,
      showNoResults: false,
      showPleaseSelect: false,
      yearMinMax: {
        min: null,
        max: null
      },
      defaultSort: {
        sort_by: 'year',
        sort_order: 'asc'
      },
      years: [],
      makes: [],
      models: [],
      form: {
        make: null,
        model: null,
        year: null,
        sort_by: null,
        sort_order: null
      },
      results: [],
      currentPage: null,
      metaData: {
        total: 0,
        last: null,
        perPage: 12,
        from: null,
        to: null
      }
    }
  },
  mounted() {
    let vm = this
    window.onpopstate = function(e) {
        vm.onPopState(e)
        // vm.abc(e)
    }
    this.getMakes()
    .then(() => this.checkUrlParams())
    .then(res => {
      console.log('after params check')
      this.initialized = true
      if(res) {
        this.getArticles()
      } else {
        this.loading = false
      }
    })
  },
  watch: {
  
  },
  methods: {
    sortableIsActive(col, dir) {
      if(!this.form.sort_by && !this.form.sort_order) {
        return this.defaultSort.sort_order == dir && this.defaultSort.sort_by == col
      } else {
        return this.form.sort_by == col && this.form.sort_order == dir
      }
    },
    handleSort(col) {
      if(this.form.sort_by == col) {
        if(this.form.sort_order == 'asc') {
          this.form.sort_order = 'desc'
        } else {
          this.form.sort_order = 'asc'
        }
      } else {
        this.form.sort_by = col
        if(!this.form.sort_order) {
          this.form.sort_order = 'asc'
        }
      }

      setTimeout(() => {
        if(this.pushState) {
          this.loading = true
          this.pushUrl()
          this.getArticles()
        }
      }, 100)
    },
    abc(e) {
      if(e.state) {
        let keys = Object.keys(e.state)
        this.formKeys.forEach(k => {
          if(keys.includes(k)) {
            this.form[k] = e.state[k]
          }
        })
        // let obj = {}
        // this.formKeys.forEach(k => {
        //   if(e.state.hasOwnProperty(k)) {

        //   }
        // })
      }
    },
    onPopState(e) {
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search)
        let obj = {}
        let page = params.get('page')
        let make = params.get('make')
        let model = params.get('model')
        let sortBy = params.get('sort_by')
        let sortOrder = params.get('sort_order')

        // params.forEach(function(value, key) {
        //     obj[key] = value
        // })
        if(page) {
          obj.page = page
          this.currentPage = parseInt(page, 10)
        } else {
            this.currentPage = null
        }
        if(!make) {
            this.form = {
                make: null,
                model: null,
                year: null,
                sort_order: null,
                sort_by: null
            }
        } else {
            obj.make = make
            this.form.make = make
            this.getModels()
            if(model) {
            obj.model = model
              this.form.model = model
              this.getYears()
            } else {
                this.form.model = null
            }
            if(year) {
              obj.year = year
              this.form.year = year
            } else {
                this.form.year = null
            }
            if(sortBy) {
              obj.sort_by = sortBy
              this.form.sort_by = sortBy
            } else {
              this.form.sort_by = null
            }
            if(sortOrder) {
              obj.sort_order = sortOrder
              this.form.sort_order = sortOrder
            } else {
              this.form.sort_order = null
            }
        }
        
        
        // if(Object.keys(obj).length) {
        //   this.loading = true
        //   this.getArticles()
          
        // } else {
        //   console.log('no params')
        // }

        this.loading = true
        this.getArticles()
    },
    generateUrl(a) {
      console.log(a)
        if(a.joomla_url) {
            return `${a.joomla_url}.html`
        }
    },
    pushUrl() {
      let params = new URLSearchParams(this.pushState)
      let str = `?${params.toString()}`
      history.pushState(this.pushState, '', str)
      
    },
    checkUrlParams() {
      return new Promise(resolve => {
        let obj = {}
        let page = this.urlParams.get('page')
        let make = this.urlParams.get('make')
        let model = this.urlParams.get('model')
        let year = this.urlParams.get('year')
        let sortBy = this.urlParams.get('sort_by')
        let sortOrder = this.urlParams.get('sort_order')
        
        if(make) {
          obj.make = make
          this.form.make = make
          this.form.model = null
          this.getModels()
          this.getYears()
          if(model) {
            console.log(model)
            obj.model = model
            this.form.model = model
            this.getYears()
          }
          if(year) {
            obj.year = year
            this.form.year = year
          }
          if(page) {
            obj.page = page
            this.currentPage = parseInt(page, 10)
          }
          if(sortBy) {
            obj.sort_by = sortBy
            this.form.sort_by = sortBy
          }
          if(sortOrder) {
            obj.sort_order = sortOrder
            this.form.sort_order = sortOrder
          }
        }
        
        
        if(Object.keys(obj).length) {
          this.pushUrl()
          resolve(true)
        } else {
          resolve(false)
        }
        
      })
      
    },
    onPageChange(val) {
      this.currentPage = val
      console.log(val)
      if(this.pushState) {
        this.loading = true
        this.pushUrl()
        this.getArticles()
      }
    },
    reqUrl(path) {
      return `${this.urlBase}${path}`
    },
    onMakeChange() {
      this.currentPage = null
      this.loading = true
      this.form.year = null
      this.form.model = null
      // this.form.sort_order = null
      // this.form.sort_by = null
      if(this.pushState) {
        this.pushUrl()
      }
      this.getModels()
      .then(() => this.getYears())
      .then(() => this.getArticles())
    },
    onModelChange() {
      this.currentPage = null
      this.loading = true
      this.form.year = null
      if(this.pushState) {
        this.pushUrl()
      }
      this.getModels()
      .then(() => this.getYears())
      .then(() => this.getArticles())
    },
    onYearChange() {
      this.currentPage = null
      if(this.pushState) {
        this.pushUrl()
      }
      this.loading = true
      this.getArticles()
    },
    getYears() {
      return new Promise((resolve, reject) => {
        let props = ['make', 'model']
        let params = { cat_id: this.catId }
        this.formKeys.forEach(k => {
          if(props.includes(k)) {
            if(this.form[k]) {
              params[k] = this.form[k]
            }
          }
          
        })
        axios.get(this.reqUrl('/api/ymm/options/years'), {
          params: params
        }).then(res => {
          this.years = res.data
          resolve(res.data)
        }).catch(err => reject(err))
      })
      
    },
    getMakes() {
      return new Promise((resolve, reject) => {
        axios.get(this.reqUrl('/api/ymm/options/makes'), {
          params: {
            cat_id: this.catId
          }
        }).then(res => {
          this.makes = res.data
          resolve(res.data)
        }).catch(err => reject(err))
      })
      
    },
    getModels() {
      let params = { cat_id: this.catId }
      if(this.form.make) {
        params.make = this.form.make
      }
      return new Promise((resolve, reject) => {
        axios.get(this.reqUrl('/api/ymm/options/models'), {
          params: params
        }).then(res => {
          this.models = res.data
          resolve(res.data)
        }).catch(err => reject(err))
      })
    },
    getArticles() {
      let currentState = history.state
      if(this.form.make) {
        axios.get(this.reqUrl(`/api/search/articles/${this.catId}`), {
            params: currentState
        })
        .then(res => {
            console.log(res)
            this.results = res.data.data
            if(!res.data.data.length) {
              this.showNoResults = true
            }
            this.metaData = {
                total: res.data.meta.total,
                last: res.data.meta.last_page,
                perPage: res.data.meta.per_page,
                from: res.data.meta.from,
                to: res.data.meta.to
            }
            this.yearMinMax = {
              min: res.data.extra_meta.year_min,
              max: res.data.extra_meta.year_max
            }
        }).finally(() => {
            this.loading = false
            setTimeout(() => {
                this.loading = false
            }, 200)
        })
      } else {   
            this.results = []
            this.currentPage = null
            this.metaData = {
                total: 0,
                last: null,
                perPage: 12,
                from: null,
                to: null
            }
            this.yearMinMax = {
              min: null,
              max: null
            }
            this.showPleaseSelect = true
            this.loading = false
            history.replaceState({}, '', '')
            
      }
      
    },
  },
  computed: {
    formKeys() {
      return Object.keys(this.form)
    },
    urlParams() {
      let url = new URL(window.location.href);
      return new URLSearchParams(url.search);
    },
    pushState() {
      let obj = {}
      if(this.currentPage) {
        obj.page = this.currentPage
      }
      this.formKeys.forEach(k => {
        if(this.form[k]) {
          obj[k] = this.form[k]
        }
      })
      if(Object.keys(obj).length) {
        return obj
      }
      return false
    },
    resultsFromTo() {
      return `${this.metaData.from} to ${this.metaData.to} of ${this.metaData.total} results`
    }
  }
}
</script>

<style>

</style>