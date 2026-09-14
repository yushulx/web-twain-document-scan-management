/**
 * mrz-settings.ts - Capture Vision settings for the `ReadMRZ` template.
 *
 * WHY THIS FILE EXISTS
 * `dynamsoft-capture-vision-bundle` 3.6.3200 ships no `ReadMRZ` preset -
 * `EnumPresetTemplate` only covers barcodes, text lines and document
 * detection/normalization. Reading an MRZ therefore needs a full
 * `CaptureVisionTemplates` definition, which is what this object is.
 *
 * WHERE IT COMES FROM
 * Trimmed from `demos/mrz-scanner/findPrecisePortraitZone.json` in this same
 * repo - the MRZ chain that demo ships and runs against live camera frames.
 * Only the sections `ReadMRZ` reaches are kept; its passport / ID / visa
 * templates, their ROIs, tasks, code-parser specs and the face-detection
 * settings are dropped.
 *
 * The pipeline is `roi_mrz` -> two tasks:
 *   - `task_mrz`, a label recogniser that localises with the `MRZLocalization`
 *     neural model (falling back to `LM_GENERAL`) and recognises with
 *     `MRZCharRecognition` / `MRZTextLineRecognition`, using the five MRTD
 *     text-line specifications (TD1 / TD2 ID, TD2 / TD3 visa, TD3 passport);
 *   - `task-detect-and-normalize-document`, which finds the document boundary,
 *     deskews and enhances the page first.
 *
 * The neural localiser is the reason this file is used instead of the
 * `ReadMRZ` template in Dynamsoft's `document_annotation` sample: that one
 * relies on the classic contour-based text-line detector, which finds nothing
 * once the MRZ characters are small (measured: no text lines at a ~18px
 * character height, where this template still reads both MRZ lines).
 *
 * Also note `line1` / `line2` in the parsed output are the RAW MRZ lines;
 * the individual fields sit under them as nested objects.
 *
 * Reference:
 * https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html
 */
export const MRZ_SETTINGS: object = {
  "CaptureVisionModelOptions": [
    {
      "Name": "MRZCharRecognition",
      "MaxModelInstances": 4
    },
    {
      "Name": "MRZTextLineRecognition"
    },
    {
      "Name": "MRZLocalization",
      "ModelArgs": {
        "InputImageLongerEdge": 640
      }
    }
  ],
  "CaptureVisionTemplates": [
    {
      "Name": "ReadMRZ",
      "ImageROIProcessingNameArray": [
        "roi_mrz"
      ],
      "SemanticProcessingNameArray": [
        "sp_mrz"
      ],
      "OutputOriginalImage": 1,
      "MaxParallelTasks": 0,
      "Timeout": 20000
    }
  ],
  "CodeParserTaskSettingOptions": [
    {
      "Name": "dcp_mrz",
      "CodeSpecifications": [
        "MRTD_TD3_PASSPORT",
        "MRTD_TD1_ID",
        "MRTD_TD2_ID",
        "MRTD_TD2_VISA",
        "MRTD_TD3_VISA"
      ]
    }
  ],
  "DocumentNormalizerTaskSettingOptions": [
    {
      "Name": "task-detect-and-normalize-document",
      "SectionArray": [
        {
          "Section": "ST_DOCUMENT_DETECTION",
          "ImageParameterName": "ip-detect-and-normalize"
        },
        {
          "Section": "ST_DOCUMENT_DESKEWING",
          "ImageParameterName": "ip-detect-and-normalize"
        },
        {
          "Section": "ST_IMAGE_ENHANCEMENT",
          "ImageParameterName": "ip-detect-and-normalize"
        }
      ]
    }
  ],
  "ImageParameterOptions": [
    {
      "Name": "ip_mrz",
      "ApplicableStages": [
        {
          "Stage": "SST_DETECT_TEXTURE",
          "TextureDetectionModes": [
            {
              "Mode": "TDM_GENERAL_WIDTH_CONCENTRATION",
              "Sensitivity": 8
            }
          ]
        },
        {
          "Stage": "SST_BINARIZE_IMAGE",
          "BinarizationModes": [
            {
              "EnableFillBinaryVacancy": 0,
              "ThresholdCompensation": 21,
              "Mode": "BM_LOCAL_BLOCK"
            }
          ]
        },
        {
          "Stage": "SST_BINARIZE_TEXTURE_REMOVED_GRAYSCALE",
          "BinarizationModes": [
            {
              "EnableFillBinaryVacancy": 0,
              "ThresholdCompensation": 21,
              "Mode": "BM_LOCAL_BLOCK"
            }
          ]
        },
        {
          "Stage": "SST_DETECT_TEXT_ZONES",
          "TextDetectionMode": {
            "Mode": "TTDM_LINE",
            "CharHeightRange": [
              5,
              1000,
              1
            ],
            "Direction": "HORIZONTAL",
            "Sensitivity": 7
          }
        }
      ]
    },
    {
      "Name": "ip-detect-and-normalize",
      "ApplicableStages": [
        {
          "Stage": "SST_DETECT_TEXT_ZONES",
          "TextDetectionMode": {
            "Mode": "TTDM_WORD",
            "Direction": "HORIZONTAL",
            "Sensitivity": 7
          }
        },
        {
          "Stage": "SST_BINARIZE_IMAGE",
          "BinarizationModes": [
            {
              "Mode": "BM_LOCAL_BLOCK",
              "BlockSizeX": 30,
              "BlockSizeY": 30,
              "EnableFillBinaryVacancy": 0,
              "ThresholdCompensation": 5
            }
          ]
        },
        {
          "Stage": "SST_BINARIZE_TEXTURE_REMOVED_GRAYSCALE",
          "BinarizationModes": [
            {
              "Mode": "BM_LOCAL_BLOCK",
              "BlockSizeX": 30,
              "BlockSizeY": 30,
              "EnableFillBinaryVacancy": 0,
              "ThresholdCompensation": 5
            }
          ]
        },
        {
          "Stage": "SST_CONVERT_TO_GRAYSCALE",
          "ColourConversionModes": [
            {
              "Mode": "CICM_GENERAL"
            },
            {
              "Mode": "CICM_EDGE_ENHANCEMENT"
            },
            {
              "Mode": "CICM_HSV",
              "ReferChannel": "H_CHANNEL"
            }
          ]
        },
        {
          "Stage": "SST_DETECT_TEXTURE",
          "TextureDetectionModes": [
            {
              "Mode": "TDM_GENERAL_WIDTH_CONCENTRATION",
              "Sensitivity": 8
            }
          ]
        }
      ]
    }
  ],
  "LabelRecognizerTaskSettingOptions": [
    {
      "Name": "task_mrz",
      "TextLineSpecificationNameArray": [
        "tls_mrz_passport",
        "tls_mrz_id_td1",
        "tls_mrz_id_td2",
        "tls_mrz_visa_td2",
        "tls_mrz_visa_td3"
      ],
      "SectionArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip_mrz",
          "StageArray": [
            {
              "Stage": "SST_PREDETECT_REGIONS"
            }
          ]
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip_mrz",
          "StageArray": [
            {
              "Stage": "SST_LOCALIZE_TEXT_LINES",
              "LocalizationModes": [
                {
                  "Mode": "LM_NEURAL_NETWORK",
                  "ModelNameArray": [
                    "MRZLocalization"
                  ]
                },
                {
                  "Mode": "LM_GENERAL"
                }
              ]
            }
          ]
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip_mrz",
          "StageArray": [
            {
              "Stage": "SST_RECOGNIZE_RAW_TEXT_LINES",
              "ConfusableCharactersPath": "ConfusableChars.data",
              "OverlappingCharactersPath": "OverlappingChars.data",
              "EnableRegexForceCorrection": 0
            },
            {
              "Stage": "SST_ASSEMBLE_TEXT_LINES"
            }
          ]
        }
      ]
    }
  ],
  "SemanticProcessingOptions": [
    {
      "Name": "sp_mrz",
      "ReferenceObjectFilter": {
        "ReferenceTargetROIDefNameArray": [
          "roi_mrz"
        ]
      },
      "TaskSettingNameArray": [
        "dcp_mrz"
      ]
    }
  ],
  "TargetROIDefOptions": [
    {
      "Name": "roi_mrz",
      "TaskSettingNameArray": [
        "task_mrz",
        "task-detect-and-normalize-document"
      ]
    }
  ],
  "TextLineSpecificationOptions": [
    {
      "Name": "tls_mrz_passport",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [
        44,
        44
      ],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\n",
      "SubGroups": [
        {
          "StringRegExPattern": "(P[A-Z<][A-Z<]{3}[A-Z<]{39}){(44)}",
          "StringLengthRange": [
            44,
            44
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}",
          "StringLengthRange": [
            44,
            44
          ],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_base",
      "CharacterModelName": "MRZCharRecognition",
      "TextLineRecModelName": "MRZTextLineRecognition",
      "CharHeightRange": [
        5,
        1000,
        1
      ],
      "BinarizationModes": [
        {
          "BlockSizeX": 41,
          "BlockSizeY": 41,
          "Mode": "BM_LOCAL_BLOCK",
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 10
        }
      ],
      "ConfusableCharactersCorrection": {
        "ConfusableCharacters": [
          [
            "0",
            "O"
          ],
          [
            "1",
            "I"
          ],
          [
            "5",
            "S"
          ]
        ],
        "FontNameArray": [
          "OCR_B"
        ]
      }
    },
    {
      "Name": "tls_mrz_id_td2",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [
        36,
        36
      ],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z<]{31}){(36)}",
          "StringLengthRange": [
            36,
            36
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}",
          "StringLengthRange": [
            36,
            36
          ],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_id_td1",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [
        30,
        30
      ],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}",
          "StringLengthRange": [
            30,
            30
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[0-9<]{4}[0-9][A-Z<]{3}[A-Z0-9<]{11}[0-9]){(30)}",
          "StringLengthRange": [
            30,
            30
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z<]{30}){(30)}",
          "StringLengthRange": [
            30,
            30
          ],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_visa_td2",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [
        36,
        36
      ],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\n",
      "SubGroups": [
        {
          "StringRegExPattern": "(V[A-Z<][A-Z<]{3}[A-Z<]{31}){(36)}",
          "StringLengthRange": [
            36,
            36
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}",
          "StringLengthRange": [
            36,
            36
          ],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_visa_td3",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [
        44,
        44
      ],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\n",
      "SubGroups": [
        {
          "StringRegExPattern": "(V[A-Z<][A-Z<]{3}[A-Z<]{39}){(44)}",
          "StringLengthRange": [
            44,
            44
          ],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}",
          "StringLengthRange": [
            44,
            44
          ],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    }
  ]
};
