CREATE TABLE solids (
    id UUID PRIMARY KEY, 
    name varchar(100), 
    material varchar(100), 
    density varchar(3)
);

CREATE TABLE printjobs (
    id UUID PRIMARY KEY, 
    solid_id UUID, 
    solid_name varchar(100), 
    solid_material varchar(100), 
    print_time integer
);

