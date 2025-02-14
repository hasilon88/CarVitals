from time import sleep
from sqlite3 import connect
from contextlib import closing
import obd

OBD_COMMANDS = {
    "speed": obd.commands.SPEED,
    "rpm": obd.commands.RPM,
    "fuel": obd.commands.FUEL_LEVEL,
    "engine_load": obd.commands.ENGINE_LOAD,
}

DATABASE_FILE = './src/data/car_vitals.db'

class Vehicle:
    _instance = None
    __connection = None

    __speed: int
    __rpm: int
    __fuel: float
    __engine_load: float

    @property
    def speed(self):
        """Returns the current speed of the vehicle."""
        return self.__speed

    @property
    def rpm(self):
        """Returns the current RPM of the vehicle."""
        return self.__rpm

    @property
    def fuel(self):
        """Returns the current fuel level of the vehicle."""
        return self.__fuel

    @property
    def engine_load(self):
        """Returns the current engine load percentage."""
        return self.__engine_load

    def __new__(cls, bluetooth_com="COM4"):
        """Singleton implementation to ensure only one instance of Vehicle."""
        if not cls._instance:
            cls._instance = super(Vehicle, cls).__new__(cls)
            cls._instance.__initialize_connection(bluetooth_com)
            cls._instance.__initialize_vehicle_attributes()
            cls._instance.__start_async_threads()

        return cls._instance

    def __initialize_connection(self, bluetooth_com):
        """Initialize asynchronous OBD-II connection."""
        try:
            self.__connection = obd.Async(portstr=bluetooth_com, fast=False, timeout=3)
            if self.__connection.is_connected():
                print(f"Connection established on {bluetooth_com}.")
            else:
                print(f"Failed to establish connection on {bluetooth_com}.")
        except Exception as e:
            print(f"Error during connection initialization: {e}")

    def __initialize_vehicle_attributes(self):
        """Initialize the vehicle's attributes."""
        self.__speed = 0
        self.__rpm = 0
        self.__fuel = 0.0
        self.__engine_load = 0.0

    def __async_thread(self, attr_name, command_key, default_value):
        """Watches an OBD-II command and updates the corresponding attribute dynamically."""
        self.__connection.watch(
            OBD_COMMANDS.get(command_key),
            lambda result: setattr(
                self, f"_Vehicle__{attr_name}", 
                result.value.magnitude if result and result.value is not None else default_value
            )
        )

    def __start_async_threads(self):
        """Start asynchronous OBD-II data fetching."""
        if self.__connection:
            self.__async_thread("rpm", "rpm", 0)
            self.__async_thread("speed", "speed", 0)
            self.__async_thread("fuel", "fuel", 0.0)
            self.__async_thread("engine_load", "engine_load", 0.0)

            self.__connection.start()

    def query(self, obd_command_name):
        """Query an OBD-II command."""
        
        if obd_command_name not in obd.commands:
            raise Exception(f"Invalid OBD command: {obd_command_name}")
            
        with self.__connection.paused():
            self.__connection.watch(obd.commands[obd_command_name])

        result = None
        for _ in range(5):
            response = self.__connection.query(obd.commands[obd_command_name])
            if response and response.value is not None:
                result = {
                    "value": str(response.value),
                    "unit": str(response.unit) if response.unit else "0",
                    "raw": str(response)
                }
                break
            sleep(0.3)

        with self.__connection.paused():
            self.__connection.unwatch(obd.commands[obd_command_name])

        return result


    def fetch_all_supported_commands(self):
        """Fetch all supported commands from the OBD-II connection."""
        supported_commands = self.__connection.supported_commands
        filtered_commands = []

        for command in supported_commands:
            name = command.name.decode("utf-8") if isinstance(command.name, bytes) else command.name
            desc = command.desc.decode("utf-8") if isinstance(command.desc, bytes) else command.desc
            cmd = command.command.decode("utf-8") if isinstance(command.command, bytes) else command.command

            if "PID" not in name and "DTC" not in name and "PID" not in desc and "DTC" not in desc:
                filtered_commands.append({'name': name, 'description': desc, 'command': cmd})

        return filtered_commands


    def __get_error_data(self, error_code):
        """Fetch diagnostic error details from the database for the given error code."""
        try:
            with connect(DATABASE_FILE) as conn, closing(conn.cursor()) as cursor:
                cursor.execute("SELECT * FROM obd_error_codes WHERE error_code LIKE ?", (f"%{error_code}%",))
                error_info = cursor.fetchone()

                if not error_info:
                    return None

                result = {
                    "error_code": error_info[0],
                    "priority": error_info[1],
                    "overview": error_info[2],
                    "description": error_info[3],
                    "estimated_repair_time": error_info[4],
                }

                for table, field in [
                    ("obd_causes", "cause"), ("obd_symptoms", "symptom"),
                    ("obd_diagnostic_steps", "step"), ("obd_solutions", "solution"),
                    ("obd_required_tools", "tool"), ("obd_cost_estimate", "cost"),
                    ("obd_related_issues", "related_issue")
                ]:
                    cursor.execute(f"SELECT {field} FROM {table} WHERE error_code LIKE ?", (f"%{error_code}%",))
                    result[field + "s"] = [row[0] for row in cursor.fetchall()]
                    
                return result
        except:
            print(f"Database error occurred")
            return None

    def fetch_diagnostic_trouble_codes(self):
        """Fetch all diagnostic trouble codes (DTCs) and their corresponding details."""
        response = None
        
        try:
            response = self.query("GET_DTC")
        except:
            return []
                    
        dtcs = response
        detailed_errors = []

        if isinstance(dtcs, list):
            for error_code in dtcs:
                error_data = self.__get_error_data(error_code)
                if error_data:
                    detailed_errors.append(error_data)
                else:
                    detailed_errors.append({"error_code": error_code, "details": "No additional details available."})
        elif isinstance(dtcs, tuple):
            error_code = dtcs
            error_data = self.__get_error_data(error_code)
            if error_data:
                detailed_errors.append(error_data)
            else:
                detailed_errors.append({"error_code": error_code, "details": "No additional details available."})
        
        return detailed_errors