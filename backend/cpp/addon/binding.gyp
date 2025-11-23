{
  "targets": [
    {
      "target_name": "rescue_addon",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "addon.cpp",
        "../src/Civilian.cpp",
        "../src/DatabaseManager.cpp",
        "../src/TriageSystem.cpp",
        "../src/Shelter.cpp",
        "../src/ShelterManager.cpp",
        "../src/Resource.cpp",
        "../src/ResourceManager.cpp",
        "../src/ReportGenerator.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "../include"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}
