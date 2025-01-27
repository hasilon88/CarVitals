import obd

class Vehicle:
    _instance = None

    __commands = {
        # Async commands
        "speed": obd.commands.SPEED,
        "rpm": obd.commands.RPM,
        "fuel": obd.commands.FUEL_LEVEL,
        "engine_temp": obd.commands.COOLANT_TEMP,
        "engine_load": obd.commands.ENGINE_LOAD,

        # Sync commands
        "fuel_status": obd.commands.FUEL_STATUS,
        "fuel_pressure": obd.commands.FUEL_PRESSURE
    }

    @property
    def get_speed(self):
        return self.__getattribute__(self, "speed") # kph

    @property
    def get_rpm(self):
        return self.__getattribute__(self,"rpm") # rpm

    @property
    def get_fuel(self):
        return self.__getattribute__(self,"fuel") # percentage

    @property
    def get_engine_temp(self):
        return self.__getattribute__(self,"engine_temp") # celsius

    @property
    def get_engine_load(self):
        return self.__getattribute__(self,"engine_load") # percentage

    @property
    def get_fuel_status(self):
        return self.__get_property(self,"fuel_status") # percentage

    @property
    def get_fuel_pressure(self):
        return self.__get_property(self,"fuel_pressure") # kilopascal

    @property
    def get_supported_commands(self):
        return self.__connection.supported_commands

    def __get_property(self, property_name):
        result = self.__connection.query(self.__commands.get(property_name))
        return result.value if result and not result.is_null() else None

    def __set_property(self, property_name, result):
        if result and not result.is_null():
            setattr(self, f"_{property_name}", result.value)
        else:
            setattr(self, f"_{property_name}", None)

    def __new__(cls, bluetooth_com="com3"):
        if not cls._instance:
            cls._instance = super(Vehicle, cls).__new__(cls)
            cls._instance.__initialize_connection(bluetooth_com)
            cls._instance.__initialize_async_connection(bluetooth_com)

            if cls._instance.__async_connection.is_connected():
                cls._instance.__start_async_threads()
            else:
                print("Failed to establish async connection.")
        return cls._instance

    def __initialize_connection(self, bluetooth_com):
        self.__connection = obd.OBD(bluetooth_com, timeout=3)

    def __initialize_async_connection(self, bluetooth_com):
        self.__async_connection = obd.Async(bluetooth_com)

    def __start_async_threads(self):
        self.__async_connection.watch(self.__commands["speed"], lambda result: self.__set_property("speed", result))
        self.__async_connection.watch(self.__commands["rpm"], lambda result: self.__set_property("rpm", result))
        self.__async_connection.watch(self.__commands["fuel"], lambda result: self.__set_property("fuel", result))
        self.__async_connection.watch(self.__commands["engine_temp"], lambda result: self.__set_property("engine_temp", result))
        self.__async_connection.watch(self.__commands["engine_load"], lambda result: self.__set_property("engine_load", result))

        self.__async_connection.start()
