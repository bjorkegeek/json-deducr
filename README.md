# JSON Deduplicated Compressed Representation
json-deducr is a way of representing JSON, which for some data sets will result in a smaller stream.
## Why?
In my app I have large JSON datasets that are quite verbose in nature. Many strings and whole smaller objects are repeated throughout the dataset. Instead of a contrieved and messy refactoring of the schema, which would also make the resulting dataset harder to work with in code, I came up with this alternative representation of JSON data. The representation on disk/wire is reduced significantly on my dataset, but gzip compression already solves this problem. However, on the receiving end, objects that are duplicated throughout the dataset will have only a single instance which also reduces memory footprint on the decoded data.
## How?
The encoder scans the data and finds strings, objects and arrays that occur more than once. These JSON values are stored in a dictionary object and are stored with a reference key wherever they occur. The encoded representation consists of this dictionary object, with the encoded object available under the key `"."`. This means that the encoded representation is also valid JSON.
## What does it look like?
Original JSON representation:
```json
{
    "persons": [
        {
            "name": "John",
            "hair_color": "brown",
            "car": {
                "brand": "Toyota",
                "model": "Corolla",
                "year": 1987
            }
        },
        {
            "name": "Lucy",
            "hair_color": "red",
            "car": {
                "brand": "Toyota",
                "model": "Corolla",
                "year": 1987
            }
        }
    ]
}
```
Deduplicated compressed representation:
```json
{
    ".": {
        ".persons": [
            {
                "A": ".John",
                "B": ".brown",
                "C": "I"
            },
            {
                "A": ".Lucy",
                "B": ".red",
                "C": "I"
            }
        ]
    },
    "A": "name",
    "B": "hair_color",
    "C": "car",
    "D": "brand",
    "E": "model",
    "F": "year",
    "G": "Toyota",
    "H": "Corolla",
    "I": {
        "D": "G",
        "E": "H",
        "F": 1987
    }
}
```
## What are the details of the format?
### Representation JSON Types
#### Numbers, true, false and null
These JSON values are unchanged in their encoded representation
#### String
An encoded string that starts with a period is simply decoded by removing this leading period. If the encoded string does not start with a period, it is actually a dictionary key and should be looked up in the dictionary object. This means that when decoded, the result may not be a string!
#### Array
An encoded array is just represented as an array of encoded values
#### Object
An encoded object is represented as a JSON object but with keys and values replaced with encoded versions.
### The dictionary object keys
The dictionary object key `"."` is special as it holds the root JSON value to be decoded. Other keys may be chosen freely by the encoder. In practice this will be done in such a way that commonly referred values have shorter keys.
## Note on immutable data
The current Javascript implementation will decode every value in the dictionary only once, and therefore arrays and objects will be subject to [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze). This will allow for efficient in-memory storage of the representation, but a deep copy must be made if the data has to change.
