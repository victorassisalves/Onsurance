import { getDatabaseInfo } from "../../model/databaseMethods"
import { customersProfilesDbRoot } from "../../database/customer.database"

export const customersData = async () => {
  try {
      const customersDbPath = customersProfilesDbRoot;
      const customers = await getDatabaseInfo(customersDbPath);
      return customers;
  } catch (error) {
    throw {
      error: error,
      message: `Failed to get customers profiles.`
    }
  }
}


export const customers = {
    '7430dd1c65deb12ccd1d247f76b0eb63':
        {
            "billing" : {
              "6f4d85bab4ff861432a565539d9b8334" : {
                "billingDay" : 6,
                "billingTimes" : 1,
                "plan" : "smart"
              }
            },
            "itemAuthorizations" : {
              "myItems" : {
                "120bfdebb39a0ecd44f43d48cee0dae1" : {
                  "9bd4939d281c66251104c6d563cbeaca" : true
                },
                "6f4d85bab4ff861432a565539d9b8334" : {
                  "1b89e81cb10f6e2e7dd522bf4627afa8" : true,
                  "9bd4939d281c66251104c6d563cbeaca" : true,
                  "c4eba5431065522de119910eaf946c5e" : true
                },
                "tires" : {
                  "120bfdebb39a0ecd44f43d48cee0dae1" : {
                    "9bd4939d281c66251104c6d563cbeaca" : true
                  },
                  "6f4d85bab4ff861432a565539d9b8334" : {
                    "9bd4939d281c66251104c6d563cbeaca" : true
                  }
                }
              }
            },
            "items" : {
              "120bfdebb39a0ecd44f43d48cee0dae1" : {
                "activationsCounter" : {
                  "accident" : 15,
                  "theft" : 15,
                  "thirdParty" : 15
                },
                "innerType" : "car",
                "itemId" : "ons2020",
                "owner" : "victor.assis.alves@gmail.com",
                "type" : "vehicle"
              },
              "6f4d85bab4ff861432a565539d9b8334" : {
                "activationsCounter" : {
                  "accident" : 25,
                  "theft" : 25,
                  "thirdParty" : 25
                },
                "innerType" : "car",
                "itemId" : "ons2019",
                "owner" : "victor.assis.alves@gmail.com",
                "type" : "vehicle"
              },
              "tires" : {
                "120bfdebb39a0ecd44f43d48cee0dae1" : {
                  "activationsCounter" : {
                    "accident" : 10
                  },
                  "itemId" : "ons2020",
                  "owner" : "victor.assis.alves@gmail.com",
                  "type" : "tires",
                  "vehicleType" : "car"
                },
                "6f4d85bab4ff861432a565539d9b8334" : {
                  "activationsCounter" : {
                    "accident" : 9
                  },
                  "itemId" : "ons2019",
                  "owner" : "victor.assis.alves@gmail.com",
                  "type" : "tires",
                  "vehicleType" : "car"
                }
              }
            },
            "personal" : {
              "activationsCounter" : 171,
              "clientId" : 3,
              "cpf" : "02222471188",
              "firstName" : "Victor",
              "lastName" : "Assis",
              "lastOrder" : 219,
              "messengerId" : 725997604191041,
              "mssId" : 2016539558419152,
              "onboard" : true,
              "userEmail" : "victor.assis.alves@gmail.com",
              "wallet" : {
                "switch" : 7273029.32
              }
            },
            "purchaseHistory" : {
              "-LnNOVvoarA672jPu7hg" : {
                "fundsToWallet" : 4198,
                "orderId" : 208,
                "purchaseDate" : 1566998662,
                "purchasedItems" : [ 1513, 386, 485 ],
                "totalFunds" : 4447
              },
              "-LtRv_g9VFN-agoJ1cKr" : {
                "fundsToWallet" : 0,
                "orderId" : 6588,
                "purchaseDate" : 1573517154,
                "purchasedItems" : [ 386 ],
                "totalFunds" : 249
              },
              "-LvgIU5YdhvEvwwWHqkT" : {
                "fundsToWallet" : 299,
                "orderId" : 8006,
                "purchaseDate" : 1575922561,
                "purchasedItems" : [ 485 ],
                "totalFunds" : 299
              },
              "-Ly_oWgC-s9PH110S9Qm" : {
                "fundsToWallet" : 4198,
                "orderId" : 219,
                "purchaseDate" : 1579035007,
                "purchasedItems" : [ 1513, 386, 485 ],
                "totalFunds" : 4447
              },
              "lastOrder" : 219
            }
    },
    '7e2611550fb199eae653bf33dd717b64': {
      "items" : {
        "0d09f8a57bb4d695a0a863bfe71be6da" : {
          "activationsCounter" : {
            "accident" : 384,
            "theft" : 384,
            "thirdParty" : 384
          },
          "innerType" : "car",
          "itemId" : "jki7208",
          "owner" : "fernandosf01@gmail.com",
          "type" : "vehicle"
        }
      },
      "personal" : {
        "activationsCounter" : 384,
        "clientId" : 60,
        "cpf" : "63634910100",
        "firstName" : "Fernando",
        "lastName" : "Filho",
        "lastOrder" : 0,
        "messengerId" : "2200986246640756",
        "onboard" : true,
        "userEmail" : "fernandosf01@gmail.com",
        "wallet" : {
          "switch" : 313918.7
        }
      }
    },
    "4a384b38b2c8bb4b600caad67e5c9f48": {
      "items" : {
        "0f7cbc12587503c8cbece21ab3b5e455" : {
          "activationsCounter" : {
            "accident" : 46,
            "theft" : 46,
            "thirdParty" : 46
          },
          "innerType" : "car",
          "itemId" : "pzz2796",
          "owner" : "eksanches@gmail.com",
          "type" : "vehicle"
        }
      },
      "personal" : {
        "activationsCounter" : 46,
        "clientId" : 120,
        "cpf" : "17914999881",
        "firstName" : "Pedro",
        "lastName" : "Sanches",
        "lastOrder" : 2560,
        "messengerId" : "2463731753671978",
        "onboard" : false,
        "userEmail" : "eksanches@gmail.com",
        "wallet" : {
          "switch" : 0
        }
      }
    }
    
    
}
  
  