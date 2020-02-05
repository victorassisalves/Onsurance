'use strict';

$(document).ready(function() {
  $('#phone').mask('(00) 00000-0000', {placeholder: "(00) 00000-0000"});
  $('#zipCode').mask('00000-000', {placeholder: "00000-000"});

  const steps = document.querySelectorAll('.form-step')
  var vm = new Vue({ 
    el: '#formApp',
    data: {
      // setps
      step: 0,
      maxStep: steps.length - 1,
      activeAlerta: false,
      message: '',

      // control form
      currentYear: new Date().getFullYear() + 1,
      
      // step 1
      vehicleType: '',           // tipo de veículo
      usageType: '',             // como será usado
      appDriver: [''],           // *nome de aplicativos de terceiro 
      appDriverOther: '',        // outros apps
      motoCc: '',                // cilindradas
      truckTrunk: '',            // se tem baú
      truckTrunkValue: '',       // valor do baú
      brand: '',                 // marca
      model: '',                 // modelo
      vehicleAge: '',            // ano
      factory: '',               // fabricação
      fipe: '',                  // valor fipe
      activeInsurance: '',       // teve seguro?
      insuranceValue: '',        // valor do seguro
      insuranceCompany: '',      // empresa do seguro
      insuranceExpiration: '',   // expiração

      garageHome: '',            // garagem em casa
      garageWork: '',            // garagem no trabalho
      hoursUsedDaily: '1',       // horas por dia
      onsuranceOnboard: '',      // Onsurance Onboard (apenas validação)
      
      // step 3
      ass24h: '',                // Assistencia 24h
      thirdPartyCoverage: 30,    // Cobertura de terceiros

      // step 4
      firstName: '',             // primeiro nome
      lastName: '',              // ultimo nome
      email: '',                 // email
      phone: '',                 // celular
      country: '',               // país
      state: '',                 // estado
      city: '',                  // cidade
      zipCode: '',               // cep

      // final step
      finalValue: {}
    },
    methods: {
      addAppDriver() {
        this.appDriver[0] = this.appDriverOther
      },
      formatPrice(value) {
        let val = (value/1).toFixed(2).replace('.', ',')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      },

      validVehicleUsage() {
        if(this.vehicleType !== 'x') {
          this.usageType = '';
          this.usageTypeApp = [];
          this.nameApp = '';
          this.appDriver = [''];
        }
      },
      nextStep() {
        if(this.step === 0) {
          if(!this.validationStep1()) {
            return false
          }
        } else if(this.step === 1) {
          if(!this.validationStep2()) {
            return false
          }
        } else if (this.step === 2) {
          if(!this.validationStep3()) {
            return false
          }
        } 
        this.advanceStep()
        
        location.href = "#form";
      },
      prevStep() {
        if (this.step > 0) {
          setTimeout(() => {
            this.step--
          }, 300)
        }
      },
      advanceStep() {
        setTimeout(() => {
          this.step++
        }, 300)
      },
      send() {
        if (this.step === 3) {
          if(!this.validationStep4()) {
            return false
          }
        }
        
        var vm = this;

        let sendSucess = 'https://api.onsurance.me/quote/auto';

        axios.post(sendSucess, {
          vehicleType: this.vehicleType,
          usageType: this.usageType,
          appDriver: this.appDriver,
          motoCc: this.motoCc,
          truckTrunk: this.truckTrunk,
          truckTrunkValue: this.truckTrunkValue,
          brand: this.brand,
          model: this.model,
          vehicleAge: this.vehicleAge,
          factory: this.factory,
          fipe: this.fipe,
          activeInsurance: this.activeInsurance,
          insuranceValue: this.insuranceValue,
          insuranceCompany: this.insuranceCompany,
          insuranceExpiration: this.insuranceExpiration,
          garageHome: this.garageHome,
          garageWork: this.garageWork,
          hoursUsedDaily: this.hoursUsedDaily,
          ass24h: this.ass24h,
          thirdPartyCoverage: this.thirdPartyCoverage,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          phone: this.phone,
          country: this.country,
          state: this.state,
          city: this.city,
          zipCode: this.zipCode,
        })
        .then(function(response) {
          console.log(response.data)
          vm.finalValue = response.data
          vm.advanceStep()
          location.href = "#form"
        })
      },
      

      /** 
       * VALIDATION
      */
      
      validationStep1() {
        // tipo de veiculo
        if(!this.vehicleType) {
          this.alert('O tipo de veículo não foi selecionado')
          return false
        } else if (this.vehicleType == 'carro'){
          
          if(!this.usageType) {
            this.alert('Você não marcou o uso do carro')
            return false 
          } else if (this.usageType == 'utilitario') {

            if(this.appDriver.length == 0) {
              this.alert('Escolha os aplicativos que você trabalha')
              return false
            } else if (this.appDriver.includes('outros')) {

              if(!this.otherNameApp) {
                this.alert('Você não preencheu o nome do aplicativo')
                return false
              }

            }

          }

        } else if (this.vehicleType == 'moto') {
          if(!this.motoCc) {
            this.alert('Você não marcou a potência da moto')
            return false
          }
        } else if (this.vehicleType == 'caminhonete') {
          if(!this.usageType) {
            this.alert('Você não marcou o uso da caminhonete')
            return false
          }
        } else if (this.vehicleType == 'vuc') {
          if(!this.truckTrunk) {
            this.alert('Você não marcou se deseja incluir o baú')
            return false
          } else if (this.truckTrunk == 'Sim') {
            if(!this.truckTrunkValue) {
              this.alert('Você não colocou o valor do baú')
              return false
            }
          }
        }
        
        // marca do veículo
        if(!this.brand) {
          this.alert('A marca do veículo não foi preenchida');
          return false
        }
        
        // modelo do veículo
        if(!this.model) {
          this.alert('O modelo do veículo não foi preenchida');
          return false
        }

        // modelo do veículo
        if(!this.vehicleAge) {
          this.alert('O ano do veículo não foi preenchido');
          return false
        }
        // validar input de ano
        const vehicleAgeInput = document.querySelector("#vehicleAge");
        if (vehicleAgeInput.value < 1996 || vehicleAgeInput.value > this.currentYear) {
          vehicleAgeInput.classList.add('bg-danger')
          setTimeout(() => {
            vehicleAgeInput.classList.remove('bg-danger')
          }, 1000);
          return false
        }

        // validar fabricação
        if(!this.factory) {
          this.alert('A fabricação do veículo não foi selecionado');
          return false
        }
        
        // validar fabricação
        if(!this.fipe) {
          this.alert('O valor do veículo não foi preenchido');
          return false
        }

        const lastInsurance = document.querySelector('#insuranceValue');
        const lastCia = document.querySelector('#insuranceCompany');
        const lastContractTime = document.querySelector('#insuranceExpiration');

        // tem seguro
        if(!this.activeInsurance) {
          this.alert('Você não marcou se tem seguro');
          return false
        } else if(this.activeInsurance === 'sim') {
          if(!lastInsurance.value) {
            this.alert('Você não colocou o valor do seguro');
            return false 
          }
          if(!lastCia.value) { 
            this.alert('Você não colocou o nome da última companhia de seguro');
            return false 
          }
          if(!lastContractTime.value) { 
            this.alert('Você não colocou a data de vencimento do seguro');
            return false 
          }
        }

        return true;
      },
      validationStep2() {
        // garagem em casa
        if(!this.garageHome) {
          this.alert('Você não selecionou se tem garagem em casa');
          return false
        } else if (!this.garageWork) {
          this.alert('Você não selecionou se tem garagem no trabalho');
          return false
        } else if(!this.onsuranceOnboard) {
          this.alert('Marque a opção');
          return false
        }

        if(!this.hoursUsedDaily) {
          this.alert('Você tem que colocar algum valor nas horas diárias');
          return false
        }

        return true
      },
      validationStep3() {

        if(!this.ass24h) {
          this.alert('Você tem que selecionar se quer assistência 24h');
          return false
        }

        return true

      },
      validationStep4() {
        if(!this.firstName) {
          this.alert('Coloque o seu nome');
          return false
        }
        if(!this.lastName) {
          this.alert('Coloque seu sobrenome');
          return false
        }
        if(!this.email) {
          this.alert('Coloque seu e-mail');
          return false
        }
        if(!this.phone) {
          this.alert('Coloque seu telefone');
          return false
        }
        if(!this.zipCode) {
          this.alert('Coloque o seu cep');
          return false
        }

        return true

      },
      alert(mensagem) {
        this.activeAlerta = true;
        this.message = mensagem;

        setTimeout(() => {
          this.activeAlerta = false;
        }, 2000);
      },
      isValueNumber: function(event) {
        if (event.target.value < 1996 || event.target.value > this.currentYear) {
          event.target.classList.add('is-invalid')
          event.target.nextElementSibling.classList.remove('text-muted')
          event.target.nextElementSibling.classList.add('text-danger')
          return false
        } else {
          event.target.classList.remove('is-invalid')
          event.target.nextElementSibling.classList.add('text-muted')
          event.target.nextElementSibling.classList.remove('text-danger')
        }
      },
      hoursUsedDailyVerify(event) {
        if(event.target.value > 24 || event.target.value < 0 || event.target.value % 1 != 0) {
          this.hoursUsedDaily = ''
        }
      },
      yearVerify(event) {
        if(event.target.value.length > 4 || event.target.value % 1 != 0) {
          this.vehicleAge = ''
        }
      }
    },
  })

});