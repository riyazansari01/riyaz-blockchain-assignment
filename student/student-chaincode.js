/*
 * Student smart contract
 *
 * Student CRUD operation
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class StudentContract extends Contract {

    // InitLedger adds a base set of students to the ledger
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const students = [
            {
                id: 'student1',
                firstName: 'Rohit',
                lastName: 'kumar',
                email: 'rohit@gmail.com',
                mobileNo: 12345,
                address: 'xyz',
                city: 'Punjab'
            },
            {
                id: 'student2',
                firstName: 'Sajan',
                lastName: 'kumar',
                email: 'sajan@gmail.com',
                mobileNo: 12345,
                address: 'abc',
                city: 'Punjab'
            },
            {
                id: 'student3',
                firstName: 'Yatin',
                lastName: 'mehndiratta',
                email: 'yatin@gmail.com',
                mobileNo: 12345,
                address: 'kww',
                city: 'Punjab'
            },
        ];

        for (const student of students) {
            student.docType = 'student';
            await ctx.stub.putState(student.id, Buffer.from(JSON.stringify(student)));
            console.info(`Student ${student.id} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // AddNewStudent issues a new student to the world state with given details.
    async AddNewStudent(ctx, id, firstName, lastName, email, mobile_no, address, city) {
        console.info('============= START : AddNewStudent for adding new student ===========');
        
        const exists = await this.StudentExists(ctx, id);
        if (exists) {
            throw new Error(`The student ${id} already exists`);
        }

        const student = {
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobileNo: mobile_no,
            address: address,
            city: city,
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(student)));
        return JSON.stringify(student);
    }

    // get single stuent details stored in the blockchain network with given id.
    async GetSingleStudent(ctx, id) {
        console.info('============= START : GetSingleStudent for getting single stuent details ===========');

        const studentJSON = await ctx.stub.getState(id); // get the student from chaincode state 
        if (!studentJSON || studentJSON.length === 0) {
            throw new Error(`The student ${id} does not exist`);
        }
        return studentJSON.toString();
    }

    // UpdateStudent updates an existing Student on the blockchain network with provided parameters. 
    async UpdateStudentInfo(ctx, id, firstName, lastName, email, mobile_no, address, city) {
        console.info('============= START : UpdateStudentInfo for updating an existing Student ===========');
        
        const exists = await this.StudentExists(ctx, id);
        if (!exists) {
            throw new Error(`The student ${id} does not exist`);
        }

        // overwriting original student details with new student Information
        const updatedStudent = {
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobileNo: mobile_no,
            address: address,
            city: city,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedStudent)));
    }

    // StudentExists returns true when Student with given ID exists in blockchain network.
    async StudentExists(ctx, id) {
        console.info('============= START : StudentExist for checking the existence of a Student ===========');

        const studentJSON = await ctx.stub.getState(id);
        return studentJSON && studentJSON.length > 0;
    }

    // GetAllStudent returns all students records found in the world state.
    async GetAllStudents(ctx) {
        console.info('============= START : GetAllStudent for getting all exists students records ===========');

        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all students in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = StudentContract;
